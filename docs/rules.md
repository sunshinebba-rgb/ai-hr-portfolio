```yaml
# AI驱动的人才盘点系统 - 结构化规则库
# 版本: v2.0 | 更新日期: 2026-03-24
# 设计原则: 标准化、可追溯、可校准
# 格式说明: YAML结构，便于AI解析和代码集成

rules:
---
outline: [2, 3]  # 显示 2 到 3 级标题的大纲
---
  # 1. 输入清晰规则
  data_cleaning:
    objective: "确保输入给AI的文本是高质量、无噪音的"
    sub_rules:
      - name: "字数阈值"
        description: "单条评语少于20字时标记为'置信度低'，提醒HR补充素材"
        action: "if length(text) < 20 then mark confidence = low and alert HR"
        rationale: "确保AI有足够的信息进行分析，避免基于片段信息做出错误判断"

      - name: "脱敏处理"
        description: "自动识别并替换敏感信息（如具体的薪资数字、家庭住址）"
        action: "replace_patterns: ['\\d{4,}', '人名', '地址']"
        rationale: "保护员工隐私，符合数据安全法规要求"

      - name: "结构化映射"
        description: "统一不同来源数据的时间戳和场景标签"
        action: "add_metadata: {timestamp: auto, context: [季度考核, 360反馈, 项目总结]}"
        rationale: "防止AI混淆历史表现与当前表现，确保评估的时效性"

  # 2. 分层能力字典 - 整合两个表格
  competency_dictionary:
    # 基层员工能力要求
    junior_level:
      target_roles: "一线员工、初级专员"
      focus_areas: ["任务执行", "个人效能", "基础协作"]
      dimensions:
        - dimension: "业绩交付"
          weight: 0.35
          competencies:
            - name: "高效执行"
              definition: "不折不扣保质保量地完成任务，贯彻目标，用最少的投入，取得最优结果"
              scoring_scale:
                0-1: "以自我为中心，认为制度和规范是自己应该做的事情，其余都是额外工作"
                2-3: "会站在别人的立场，自我谦让，能在一定时间范围内满足公司内外部客户的需求"
                4-5: "从客户角度出发，始终保持一种积极、主动、热情、专业的态度，有提高客户满意度的意识和行为"
                6-7: "有强烈的服务意识，有了以公司为家，热爱集体，无私奉献的风格和精神"
              positive_indicators: ["按时交付", "质量达标", "资源节约"]
              negative_indicators: ["经常延期", "质量不稳定", "资源浪费"]

        - dimension: "学习潜力"
          weight: 0.25
          competencies:
            - name: "学习成长"
              definition: "不断主动学习新知识，提升自身能力，提高工作质量与工作效率"
              scoring_scale:
                0-1: "对学习的热情不够，满足于目前掌握的知识技能，不主动学习，不愿接受新事物，新观点"
                2-3: "根据工作需求，学习必要的知识与技能，并能运用到工作中"
                4-5: "主动分析自身与工作要求的差距，积极向他人请教，快速学习新事物，明显提高工作效率和质量"
                6-7: "在工作中持续学习，总结并运用于工作，并主动营造相互分享、学习的氛围，带动他人共同成长"
              positive_indicators: ["主动学习", "快速掌握", "应用实践"]
              negative_indicators: ["安于现状", "学习缓慢", "学用脱节"]

        - dimension: "动力与韧性"
          weight: 0.20
          competencies:
            - name: "责任担当"
              definition: "个人对自己、他人、集体、国家所负责任的认识、情感和信念，以及与之相应的遵守规范、承担责任和履行义务的自觉态度而产生的情绪体验"
              scoring_scale:
                0-1: "工作的完成情况以上班时间为界，对未完成的工作拖拉，找借口"
                2-3: "对待工作认真负责，尽量在规定时间内保质保量的完成"
                4-5: "合理安排并规划自己的工作，对于未完成的任务勇于承担责任，并主动解决，落实"
                6-7: "以公司为家，事业心较重，对于自己、部门的工作，甚至公司未来的发展方向等问题主动思考，并以此为己任，感到自己身负责任重大"
              positive_indicators: ["主动承担", "勇于负责", "解决问题"]
              negative_indicators: ["推卸责任", "消极应对", "回避问题"]

        - dimension: "协作影响"
          weight: 0.20
          competencies:
            - name: "服务意识"
              definition: "发自内心，自觉主动做好服务工作的观念和愿望，对内外部客户提供服务的意识和态度"
              scoring_scale: "同上文的0-7分标准"
              positive_indicators: ["主动服务", "客户满意", "积极响应"]
              negative_indicators: ["被动应付", "客户投诉", "反应迟缓"]

            - name: "团队合作"
              definition: "为达到既定目标所显现出来的自愿合作和协同努力的精神"
              scoring_scale:
                0-1: "独断专行，只注重个人本职工作，不能与他人很好合作"
                2-3: "团队合作精神不够强，在完成本职工作的同时，偶尔协助他人，有时会对工作产生影响"
                4-5: "能够与他人合作共事，相互支持，和其他人一起解决问题，获取同事信任和支持，保证对团队任务的完成"
                6-7: "善于与他人合作共事，相互支持，充分发挥各自的优势，并能积极推动在全公司范围内的协作观念，保持良好的团队工作氛围"
              positive_indicators: ["主动协作", "支持同事", "团队贡献"]
              negative_indicators: ["单打独斗", "拒绝协作", "影响团队"]

    # 中层管理者能力要求
    middle_level:
      target_roles: "经理、总监、部门负责人"
      focus_areas: ["流程优化", "团队管理", "跨部门协作"]
      dimensions:
        - dimension: "解决问题"
          weight: 0.30
          competencies:
            - name: "解决问题"
              definition: "运用专业知识和经验，发现问题，制定计划并提出解决方案的能力"
              scoring_scale:
                0-1: "处理问题混乱无章，无从下手，不能冷静思考和面对"
                2-3: "有良好的心态应对问题，随机应变，能井井有条的梳理好工作"
                4-5: "能结合当前人财物等资源的情况制定经济高效的方案，具有统筹协调资源解决问题的能力"
                6-7: "根据问题发生，制定改进工作方法、工作流程或者相关的规章制度等，能够利用问题进行反思和升华"
              positive_indicators: ["系统分析", "高效解决", "创新方案"]
              negative_indicators: ["问题拖延", "表面解决", "缺乏深度"]

        - dimension: "沟通影响"
          weight: 0.25
          competencies:
            - name: "沟通影响"
              definition: "采取语言来影响他人的思想和行为，在团队里树立个人权威"
              scoring_scale:
                0-1: "只关注个人，未表现出试图影响和说服别人的意图，或者有意图但未采取行动"
                2-3: "有一定的沟通技巧，能取得他人的支持和认同"
                4-5: "善于用别人乐于接受的方式，懂得有效的沟通是双向交流，会换位思考，达成共识"
                6-7: "有极强的沟通协调能力，并能通过沟通，推动他人或带领团队达成目标"
              positive_indicators: ["有效沟通", "影响他人", "达成共识"]
              negative_indicators: ["沟通障碍", "缺乏影响", "难以共识"]

        - dimension: "培养人才"
          weight: 0.20
          competencies:
            - name: "培养人才"
              definition: "为下属提供有建设性的反馈意见，激励其改进工作方法以使其迅速实现职业发展"
              scoring_scale:
                0-1: "对于下属的工作不做建设性的指示，不提供让其成长的工作机会"
                2-3: "给与下属较多的工作机会，但分配的任务更多的是事务性的处理，没有结合其未来发展方向进行有效的引导"
                4-5: "能够结合员工未来发展意向，有针对性的进行工作分配，并执行过程中给与及时的指导"
                6-7: "将培养下属作为自己的一项重要任务，经常与下属当面探讨其发展方向，以及目标达成的手段"
              positive_indicators: ["指导下属", "发展规划", "激发潜力"]
              negative_indicators: ["忽视培养", "任务导向", "限制成长"]

        - dimension: "动力与韧性"
          weight: 0.15
          competencies:
            - name: "先公后私"
              definition: "把公司和团队的利益放在前，把个人利益放在后面"
              scoring_scale:
                0-1: "在工作过程中更多考虑自己个人的利益，不愿为集体付出"
                2-3: "当公司利益和个人利益发生冲突的时候，会以大局为重，服从公司安排"
                4-5: "将公司整体利益置于个人利益之上，面临冲突能从公司组织层面主动牺牲自我利益，并提出方案"
                6-7: "全心全意热爱自己的工作，永远把公司利益放第一位，公司的成功高于个人的财富和名誉"
              positive_indicators: ["顾全大局", "团队优先", "牺牲奉献"]
              negative_indicators: ["个人主义", "自私自利", "损害集体"]

        - dimension: "系统思考"
          weight: 0.10
          competencies:
            - name: "创新能力"
              definition: "采用原来没有的方式方法解决问题，或创造新的机会和方法，提高工作效率和产品、服务的性能"
              scoring_scale:
                0-1: "思想保守，满足现状，缺乏创新主动性，不想做任何改变"
                2-3: "具备一定的学习和分析能力，对本职工作的纵深开发和横向联系的优化"
                4-5: "善于思考，乐于提出对公司有利的新的观点和独特的想法，提供公司业务增长的创意"
                6-7: "敏锐洞察商机，善于制定创新改进计划，使用全新方法整合资源，为公司创造全新的市场机会"
              positive_indicators: ["创新思维", "改进方法", "创造价值"]
              negative_indicators: ["墨守成规", "抗拒变化", "缺乏创新"]

    # 高层管理者能力要求
    senior_level:
      target_roles: "副总裁、CXO、事业部负责人"
      focus_areas: ["战略决策", "组织变革", "商业创新"]
      dimensions:
        - dimension: "战略决策"
          weight: 0.35
          competencies:
            - name: "决策力"
              definition: "具有战略眼光和客观思维能力，掌握各种方法及时做出决定，并勇于承担责任"
              scoring_scale:
                0-1: "不能在既定的要求下做出决策"
                2-3: "能评估困难程度，利用一定的方法在一定的时限内做出决策"
                4-5: "能在较短时间内借助各方资源做出决策，能评估各类解决方案对组织的风险和收益并确定备选方案"
                6-7: "在对机会和潜在风险做出战略评估的基础上做出决策，能回顾过去的经验并衡量各种备选方案的正负影响，明确组织发展方向，做出对组织利益最大风险最低的决策，始终将决策与组织的长远发展结合"
              positive_indicators: ["果断决策", "风险评估", "战略眼光"]
              negative_indicators: ["犹豫不决", "风险忽视", "短视决策"]

        - dimension: "商业洞察"
          weight: 0.25
          competencies:
            - name: "商业洞察"
              definition: "在商业领域透过现象看本质，洞察内在的连接关系，以此找到方向和解决问题的方法，实现商业预期"
              scoring_scale:
                0-1: "较少关注行业发展状况，应对变化改进不及时"
                2-3: "快速洞察行业和市场的变化，根据公司实际情况提出针对性、建设性建议"
                4-5: "主动了解并收集反馈标杆企业竞争和发展策略，提出应对策略，并迅速采取行动，抓住机遇"
                6-7: "时刻关注公司战略，对行业和市场发展有独到的见解，帮助公司制定长期的发展规划，保持公司的领先优势"
              positive_indicators: ["市场洞察", "趋势把握", "战略预见"]
              negative_indicators: ["市场迟钝", "趋势误判", "战略短视"]

        - dimension: "系统思考"
          weight: 0.20
          competencies:
            - name: "变革创新"
              definition: "从公司需求出发，对新观念、新方法持开放心态，支持并推动公司变革"
              scoring_scale:
                0-1: "光用固有的思维解决问题，不愿意改变或接受新事物，对新的观念与方法抵触"
                2-3: "接受新概念，新方法，做出调整适应变化，配合公司变革"
                4-5: "主动更新迭代知识、思维方式、工作方法；熟悉公司变革的需求与风险，制定并实施有效的计划"
                6-7: "以公司持续发展着眼，打破公司过往不适宜的流程和方法；并正面引导和带动同事主动做出改变，推动公司变革"
              positive_indicators: ["推动变革", "创新思维", "适应变化"]
              negative_indicators: ["抗拒变革", "保守思维", "难以适应"]

        - dimension: "动力与韧性"
          weight: 0.10
          competencies:
            - name: "事业雄心"
              definition: "努力成就一番事业的奋斗精神和热爱工作、希望取得良好成绩的积极心理状态"
              scoring_scale:
                0-1: "做事保守求稳，把工作做好的愿望不强烈，很少为自己设立目标"
                2-3: "主动给自己设定目标，主动与上级沟通，表现出把工作做好的愿望"
                4-5: "为自己设定并努力实现挑战性的目标，表现出把工作做好的强烈愿望，会做阶段性总结和复盘"
                6-7: "个人发展目标非常明确，有极强的工作积极性，接受更高挑战，站在更高层次考虑事业方向"
              positive_indicators: ["远大抱负", "持续奋斗", "追求卓越"]
              negative_indicators: ["小富即安", "缺乏动力", "安于现状"]

        - dimension: "协作影响"
          weight: 0.10
          competencies:
            - name: "领导激励"
              definition: "激发、鼓励和调动人的热情和动机，使人尽可能充分发挥和维持潜在的工作动机，更好地达成目标"
              scoring_scale:
                0-1: "埋头做事，领导意识不强，无法带领团结队伍，不能调节团队工作积极性"
                2-3: "在日常工作中能通过个人语言和行为，有效调动团队的积极性和主动性"
                4-5: "懂得运用一些特定的奖惩形式，科学激励员工，更大程度调动员工的积极性和创造性，实现个人与组织预期目标的统一"
                6-7: "深入调查研究，不断了解员工需要层次和需要结构的变化趋势，有针对性的计划并采取激励措施，推动目标的实现"
              positive_indicators: ["激励团队", "鼓舞士气", "凝聚人心"]
              negative_indicators: ["士气低落", "缺乏激励", "团队涣散"]

  # 3. 模型判定规则 (精修版)
  model_logic:
    # 九宫格坐标核心算法
    nine_box:
      x_axis:
        name: "业绩维度"
        # 核心权重公式
        formula: "performance_score = (average_performance_score * 0.7) + (daily_work_score * 0.3)"
        
        # 30% 权重：日常工作评分细则 (基于 BEI 行为观察)
        daily_work_evaluation:
          calculation: "daily_work_score = average(贡献分, 质量分, 及时性分)"
          dimensions:
            - dimension: "工作贡献"
              levels:
                9-10: "岗位工作贡献远超预期，对部门业务产生显著推动"
                6-8: "岗位工作贡献超出预期，能主动承担额外职责"
                3-5: "岗位工作贡献达到预期，按部就班完成任务"
                0-2: "岗位工作贡献未达到预期，需密切关注"
            
            - dimension: "工作质量"
              levels:
                9-10: "工作质量卓越，完全胜任岗位要求且具备标杆水准"
                6-8: "工作质量符合期望，能稳定交付高质量产出"
                3-5: "工作质量勉强符合期望，存在小瑕疵但基本达标"
                0-2: "工作质量不符合期望，达不到基本岗位要求"

            - dimension: "工作完成及时性"
              levels:
                9-10: "所有工作都能及时或提前完成，具备极强的节奏感"
                6-8: "大部分工作能按时完成，项目推进效率较高"
                3-5: "部分工作能按时完成，偶尔存在拖延现象"
                0-2: "工作几乎不能按期完成，经常性拖延，影响团队进度"
        mapping:
          1:
            range: "0-60分"
            label: "低"
            description: "未达到基本工作要求"
          2:
            range: "61-85分"
            label: "中"
            description: "达到工作要求，表现稳定"
          3:
            range: "86-100分"
            label: "高"
            description: "超出预期，表现优异"

      y_axis:
        name: "潜力维度"
        formula: "potential_score = 素质评价表平均分"
        mapping:
          1:
            range: "0-60分"
            label: "低"
            description: "成长空间有限"
          2:
            range: "61###85分"
            label: "中"
            description: "有成长潜力"
          3:
            range: "86-100分"
            label: "高"
            description: "高潜力人才，成长曲线陡峭"

    # 九宫格定位逻辑
    positioning:
      high_perf_high_pot: "核心人才（重点关注）"
      high_perf_mid_pot: "稳定贡献者（保持激励）"
      high_perf_low_pot: "专业骨干（发挥专长）"
      mid_perf_high_pot: "明日之星（重点培养）"
      mid_perf_mid_pot: "中坚力量（稳定发展）"
      mid_perf_low_pot: "待观察者（关注提升）"
      low_perf_high_pot: "问题员工（重点关注）"
      low_perf_mid_pot: "待改进者（制定计划）"
      low_perf_low_pot: "优化对象（考虑调整）"

  # 4. 输出生成规则
  output_generation:
    # 固定输出格式
    format:
      required_sections:
        - section: "nine_box_location"
          description: "九宫格坐标定位"
          example: "(业绩:高, 潜力:中) → 坐标(3,2)"

        - section: "core_portrait_tags"
          description: "核心画像标签"
          example: "['执行型人才', '需提升沟通']"

        - section: "strength_evidence"
          description: "优势证据片段"
          requirement: "必须引用原文中的具体描述"
          example: "优势证据：'独立推进复杂项目，按时交付质量良好'（源自评语第2段）"

        - section: "areas_for_improvement"
          description: "待改进点"
          requirement: "基于能力字典的负向指标"
          example: "待改进：跨部门沟通主动性不足（协作影响维度）"

        - section: "development_suggestions"
          description: "发展建议（IDP）"
          requirement: "具体可执行，与待改进点对应"
          example: "建议：参与跨部门沟通工作坊，每月主动组织1次跨部门会议"

        - section: "next_steps"
          description: "下一步行动"
          example: "1. 安排直属上级沟通反馈 2. 制定季度提升计划 3. 3个月后复查"

    # 证据溯源要求
    evidence_traceability:
      requirement: "所有判断必须可追溯到输入文本的特定片段"
      format: "该判断基于评语中的：'[原文片段]'（第X段）"
      purpose: "确保决策透明，便于HR校准"

    # 置信度标记系统
    confidence_marking:
      levels:
        high:
          score_range: "0.8-1.0"
          conditions:
            - "输入文本一致，无矛盾"
            - "证据充分，有多个支持点"
            - "文本长度充足（>50字）"
            - "无敏感信息干扰"
          action: "直接采纳，无需人工复核"

        medium:
          score_range: "0.5-0.79"
          conditions:
            - "输入文本基本一致，但有少量模糊表述"
            - "证据较为充分，但有个别点需要核实"
            - "文本长度适中（20-50字）"
            - "有轻度敏感信息"
          action: "轻度审核，HR快速浏览确认"

        low:
          score_range: "0-0.49"
          conditions:
            - "输入文本自相矛盾"
            - "证据不足或存在明显冲突"
            - "文本长度不足（<20字）"
            - "有严重敏感信息问题"
          action: "标记'冲突预警'，要求HR人工介入并补充信息"

      # 置信度计算规则
      calculation:
        base_score: 1.0
        deductions:
          - condition: "文本长度 < 20字"
            deduction: 0.4
          - condition: "存在矛盾表述"
            deduction: 0.3
          - condition: "缺乏具体事例"
            deduction: 0.2
          - condition: "有敏感信息未脱敏"
            deduction: 0.1
```
