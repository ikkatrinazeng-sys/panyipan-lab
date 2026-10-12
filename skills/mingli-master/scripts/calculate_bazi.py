#!/usr/bin/env python3
"""八字（四柱）排盘脚本，使用 lunar_python 库

排盘口径（与 references/bazi_reference.md 一致）：
  - 子时：23:00 起即换日，日柱、时柱都算次日（不分早晚子时）
  - 真太阳时：与紫微排盘同一套校正（经度时差，可选均时差），校正后的时间再排四柱
  - 年柱以立春换年，月柱以节换月（由 lunar_python 按节气精确交接）
  - 大运：阳男阴女顺排、阴男阳女逆排；起运按 3 天折 1 岁、1 天折 4 个月、1 个时辰折 10 天，
    精确到岁、月、日
  - 不排神煞；保留十二长生（日主在四支的"星运"及各柱"自坐"），作气势强弱参考
"""

import argparse
import datetime
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from calculate_chart import city_longitude, apply_true_solar_time  # noqa: E402

GAN_WUXING = {'甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
              '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'}
GAN_YINYANG = {g: ('阳' if i % 2 == 0 else '阴') for i, g in enumerate('甲乙丙丁戊己庚辛壬癸')}
ZHI_WUXING = {'子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
              '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'}

# 月令 → 季节与寒暖燥湿，供《穷通宝鉴》调候第一步使用
MONTH_CLIMATE = {
    '寅': ('孟春', '余寒未尽'), '卯': ('仲春', '温和'), '辰': ('季春', '渐暖偏湿'),
    '巳': ('孟夏', '渐热'), '午': ('仲夏', '炎热'), '未': ('季夏', '热而燥'),
    '申': ('孟秋', '余热渐凉'), '酉': ('仲秋', '凉燥'), '戌': ('季秋', '寒而燥'),
    '亥': ('孟冬', '渐寒'), '子': ('仲冬', '严寒'), '丑': ('季冬', '寒而湿'),
}
# 严寒 / 酷暑月令：调候优先级最高
URGENT_TIAOHOU = {'子': '寒', '丑': '寒', '亥': '寒', '巳': '暖', '午': '暖', '未': '暖'}


ZHI_ORDER = '子丑寅卯辰巳午未申酉戌亥'
CHANG_SHENG = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养']
# 各天干的长生位（土随火：戊寄寅、己寄酉）；阳干顺行、阴干逆行
CHANG_SHENG_START = {'甲': '亥', '乙': '午', '丙': '寅', '丁': '酉', '戊': '寅',
                     '己': '酉', '庚': '巳', '辛': '子', '壬': '申', '癸': '卯'}


def chang_sheng(gan, zhi):
    """天干在某地支的十二长生状态。"""
    step = ZHI_ORDER.index(zhi) - ZHI_ORDER.index(CHANG_SHENG_START[gan])
    if GAN_YINYANG[gan] == '阴':
        step = -step
    return CHANG_SHENG[step % 12]


def pillar(ec, name):
    """取一柱的全部信息。name 为 Year / Month / Day / Time。"""
    g = getattr(ec, f'get{name}Gan')()
    z = getattr(ec, f'get{name}Zhi')()
    hide = getattr(ec, f'get{name}HideGan')()
    return {
        'ganzhi': g + z,
        'gan': g,
        'zhi': z,
        'gan_wuxing': GAN_WUXING[g] + GAN_YINYANG[g],
        'zhi_wuxing': ZHI_WUXING[z],
        'shishen_gan': '日主' if name == 'Day' else getattr(ec, f'get{name}ShiShenGan')(),
        'hide_gan': hide,
        'shishen_hide': getattr(ec, f'get{name}ShiShenZhi')(),
        'nayin': getattr(ec, f'get{name}NaYin')(),
        'xingyun': getattr(ec, f'get{name}DiShi')(),   # 日主在此支的十二长生
        'xunkong': getattr(ec, f'get{name}XunKong')(),
    }


def wuxing_count(pillars):
    """五行计数：天干 + 地支本气各计 1；另给含藏干的计数（藏干各计 0.5）。"""
    surface = {k: 0 for k in '木火土金水'}
    with_hide = {k: 0.0 for k in '木火土金水'}
    for p in pillars:
        surface[GAN_WUXING[p['gan']]] += 1
        surface[ZHI_WUXING[p['zhi']]] += 1
        with_hide[GAN_WUXING[p['gan']]] += 1
        for h in p['hide_gan']:
            with_hide[GAN_WUXING[h]] += 0.5
    return surface, with_hide


def main():
    parser = argparse.ArgumentParser(description='八字四柱排盘')
    parser.add_argument('--solar', required=True, help='公历日期 YYYY-M-D')
    parser.add_argument('--time', required=True, help='出生时间 HH:MM（北京时间钟表时间）')
    parser.add_argument('--longitude', type=float, help='出生地经度（东经，度）')
    parser.add_argument('--city', help='出生城市名（自动查经度）；与 --longitude 二选一')
    parser.add_argument('--eot', action='store_true', help='同时计入均时差，更精确')
    parser.add_argument('--no-true-solar', action='store_true',
                        help='不做真太阳时校正（仅在出生地完全未知时使用，解读需说明）')
    parser.add_argument('--gender', required=True, help='性别 男/女')
    parser.add_argument('--years', type=int, default=8, help='输出几步大运（默认 8）')
    parser.add_argument('--output', required=True, help='输出 JSON 文件路径')
    args = parser.parse_args()

    try:
        from lunar_python import Solar
    except ImportError:
        print('请先安装 lunar_python: python3 -m pip install lunar_python --user', file=sys.stderr)
        sys.exit(1)

    if args.gender not in ('男', '女'):
        print('--gender 只能是 男 或 女', file=sys.stderr)
        sys.exit(1)

    hh, mm = (int(x) for x in args.time.split(':'))
    solar_date = datetime.datetime.strptime(args.solar, '%Y-%m-%d').strftime('%Y-%m-%d')

    correction = None
    if args.no_true_solar:
        dt = datetime.datetime.strptime(f'{solar_date} {hh:02d}:{mm:02d}', '%Y-%m-%d %H:%M')
    else:
        lon = args.longitude if args.longitude is not None else city_longitude(args.city)
        if lon is None:
            print('需要出生地：用 --city 或 --longitude 指定（城市未收录时直接传经度）；'
                  '实在不知道才用 --no-true-solar', file=sys.stderr)
            sys.exit(1)
        _, _, correction = apply_true_solar_time(solar_date, hh, mm, lon, use_eot=args.eot)
        dt = datetime.datetime.strptime(correction['true_solar_time'], '%Y-%m-%d %H:%M')
        if correction['crossed_boundary']:
            print(f"⚠ 真太阳时校正跨越了时辰边界：钟表 {correction['clock_time']} → "
                  f"真太阳时 {correction['true_solar_time']}，时柱已按校正后时间排。", file=sys.stderr)

    solar = Solar.fromYmdHms(dt.year, dt.month, dt.day, dt.hour, dt.minute, 0)
    lunar = solar.getLunar()
    ec = lunar.getEightChar()
    ec.setSect(1)  # 1 = 23:00 起日柱即换次日

    pillars = {key: pillar(ec, name) for key, name in
               (('year', 'Year'), ('month', 'Month'), ('day', 'Day'), ('hour', 'Time'))}
    # 十二长生"自坐"：各柱天干在本柱地支的状态
    for p in pillars.values():
        p['zizuo'] = chang_sheng(p['gan'], p['zhi'])

    surface, with_hide = wuxing_count(pillars.values())

    yun = ec.getYun(1 if args.gender == '男' else 0, 1)  # sect 1：3 天 1 岁、1 天 4 月、1 时辰 10 天
    start_solar = yun.getStartSolar()
    dayun = []
    for d in yun.getDaYun()[1:args.years + 1]:  # 第 0 项是起运前的童限
        dayun.append({
            'ganzhi': d.getGanZhi(),
            'start_age': d.getStartAge(),     # 虚岁
            'end_age': d.getEndAge(),
            'start_year': d.getStartYear(),
            'end_year': d.getEndYear(),
        })

    month_zhi = pillars['month']['zhi']
    season, climate = MONTH_CLIMATE[month_zhi]
    prev_jie = lunar.getPrevJie()
    next_jie = lunar.getNextJie()

    result = {
        'method': {
            'zi_hour': '23:00 起换日（日柱、时柱都算次日）',
            'true_solar_time': not args.no_true_solar,
            'qiyun': '3 天折 1 岁、1 天折 4 个月、1 个时辰折 10 天',
            'shensha': '不排',
        },
        'input': {'solar': solar_date, 'clock_time': args.time, 'gender': args.gender,
                  'city': args.city, 'longitude': args.longitude},
        'true_solar_time_correction': correction,
        'calc_datetime': dt.strftime('%Y-%m-%d %H:%M'),
        'lunar_date': f'{lunar.getYearInGanZhi()}年 {lunar.getMonthInChinese()}月{lunar.getDayInChinese()}',
        'bazi': ' '.join(pillars[k]['ganzhi'] for k in ('year', 'month', 'day', 'hour')),
        'pillars': pillars,
        'day_master': {
            'gan': pillars['day']['gan'],
            'wuxing': pillars['day']['gan_wuxing'],
            'yueling_xingyun': pillars['month']['xingyun'],  # 日主在月令的长生状态，旺衰第一参考
        },
        'yueling': {
            'zhi': month_zhi,
            'season': season,
            'climate': climate,
            'tiaohou_urgent': URGENT_TIAOHOU.get(month_zhi),  # '寒'=急需暖，'暖'=急需寒润，None=不急
            'benqi': pillars['month']['hide_gan'][0],         # 月令本气，取格第一参考
            'hide_gan': pillars['month']['hide_gan'],
            'prev_jie': f'{prev_jie.getName()} {prev_jie.getSolar().toYmdHms()}',
            'next_jie': f'{next_jie.getName()} {next_jie.getSolar().toYmdHms()}',
        },
        'wuxing_count': {'surface': surface, 'with_hidden': with_hide},
        'taiyuan': ec.getTaiYuan(),
        'minggong': ec.getMingGong(),
        'qiyun': {
            'direction': '顺排' if yun.isForward() else '逆排',
            'years': yun.getStartYear(),
            'months': yun.getStartMonth(),
            'days': yun.getStartDay(),
            'text': f'出生后 {yun.getStartYear()} 年 {yun.getStartMonth()} 个月 {yun.getStartDay()} 天起运',
            'start_solar': start_solar.toYmd(),
        },
        'dayun': dayun,
    }

    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f"八字：{result['bazi']}（日主 {result['day_master']['gan']}{result['day_master']['wuxing']}，"
          f"生于{season}{month_zhi}月，{climate}）")
    print(f"{result['qiyun']['text']}（{result['qiyun']['direction']}，交运日 {result['qiyun']['start_solar']}）")
    print(f'已写入 {args.output}')


if __name__ == '__main__':
    main()
