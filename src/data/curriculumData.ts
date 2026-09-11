import { TopicDefinition, QuizQuestion } from '../types';

export const TOPICS: TopicDefinition[] = [
  {
    id: 'circle-wheel',
    title: 'Hình Tròn → Chuyển Động Lăn Của Bánh Xe & Đường Cycloid',
    shortDesc: 'Từ phương trình đường tròn 2D/3D suy ra chuyển động lăn không trượt, tâm quay tức thời và quỹ đạo Cycloid.',
    gradeLevel: 'Lớp 10',
    mathFormula: 'x^2 + y^2 = R^2 \\implies x(t) = R(\\omega t - \\sin\\omega t), \\; y(t) = R(1 - \\cos\\omega t)',
    mathExplanation: 'Phương trình đường tròn bán kính R. Khi hình tròn vừa lăn vừa tịnh tiến với vận tốc v = \\omega R, một điểm P trên vành vạch ra đường Cycloid kì diệu trong mặt phẳng toạ độ.',
    physicsTopic: 'Vật lý 10: Tính tương đối của chuyển động & Tâm quay tức thời',
    physicsFormula: 'v_{tiếp\\_xúc} = 0, \\; v_{tâm} = v_0 = \\omega R, \\; v_{đỉnh} = 2v_0 = 2\\omega R',
    physicsExplanation: 'Trong chuyển động lăn không trượt, vận tốc của một điểm trên bánh xe là tổng hợp vận tốc tịnh tiến và vận tốc quay quanh tâm: v = v_tt + v_q. Tại điểm tiếp xúc mặt đất, hai vận tốc này ngược chiều và triệt tiêu nhau hoàn toàn (v = 0). Điểm tiếp xúc chính là tâm quay tức thời!',
    realWorldApp: 'Bánh xe ô tô, xe đạp bám đường nhờ ma sát nghỉ (không trượt); thiết kế vòm cầu vồng máng trượt Cycloid (đường dốc nhanh nhất - Brachistochrone).',
    parameters: [
      {
        id: 'radius',
        name: 'Bán kính bánh xe (R)',
        symbol: 'R',
        unit: 'm',
        min: 0.5,
        max: 3.0,
        step: 0.1,
        defaultValue: 1.5,
        description: 'Bán kính hình học của bánh xe tròn.'
      },
      {
        id: 'omega',
        name: 'Tốc độ góc (ω)',
        symbol: 'ω',
        unit: 'rad/s',
        min: 0.5,
        max: 5.0,
        step: 0.2,
        defaultValue: 1.8,
        description: 'Tốc độ quay của vành bánh xe quanh trục tâm.'
      },
      {
        id: 'pointRatio',
        name: 'Vị trí điểm khảo sát (r/R)',
        symbol: 'r/R',
        unit: '',
        min: 0.0,
        max: 1.0,
        step: 0.1,
        defaultValue: 1.0,
        description: 'Khoảng cách từ tâm đến điểm khảo sát (1.0 = vành ngoài Cycloid, <1.0 = Trochoid).'
      }
    ],
    initialParams: {
      radius: 1.5,
      omega: 1.8,
      pointRatio: 1.0
    },
    cameraPosition: [0, 2, 8]
  },
  {
    id: 'circle-earth',
    title: 'Hình Cầu & Đường Tròn → Quỹ Đạo Chuyển Động Của Trái Đất',
    shortDesc: 'Từ phương trình mặt cầu và đường tròn 3D liên hệ lực vạn vật hấp dẫn đóng vai trò lực hướng tâm.',
    gradeLevel: 'Lớp 10',
    mathFormula: 'x^2 + y^2 + z^2 = R^2 \\implies \\vec{F}_{hd} = G \\frac{M m}{r^2} \\hat{r} = m \\frac{v^2}{r} \\hat{r}',
    mathExplanation: 'Không gian hình cầu toạ độ (x,y,z). Quỹ đạo Trái Đất quanh Mặt Trời xấp xỉ đường tròn phẳng bán kính r, trong khi Trái Đất có dạng hình cầu tự quay quanh trục nghiêng 23.5°.',
    physicsTopic: 'Vật lý 10: Lực hướng tâm & Định luật vạn vật hấp dẫn (Newton)',
    physicsFormula: 'v = \\sqrt{\\frac{G M}{r}}, \\quad T = 2\\pi \\sqrt{\\frac{r^3}{G M}}, \\quad a_{ht} = \\frac{v^2}{r} = \\omega^2 r',
    physicsExplanation: 'Lực hấp dẫn giữa Mặt Trời và Trái Đất đóng vai trò chính là lực hướng tâm kéo Trái Đất lệch khỏi quán tính đường thẳng, tạo ra chuyển động tròn đều. Véctơ vận tốc tức thời luôn tiếp tuyến quỹ đạo, còn vectơ gia tốc luôn hướng vuông góc vào tâm Mặt Trời.',
    realWorldApp: 'Chuyển động của hành tinh trong hệ Mặt Trời, tính toán phóng vệ tinh nhân tạo địa tĩnh (quỹ đạo Geostationary), mùa trong năm do trục nghiêng.',
    parameters: [
      {
        id: 'orbitRadius',
        name: 'Bán kính quỹ đạo (r)',
        symbol: 'r',
        unit: 'AU (quy đổi)',
        min: 2.0,
        max: 6.0,
        step: 0.2,
        defaultValue: 4.0,
        description: 'Khoảng cách từ tâm Mặt Trời đến tâm hành tinh.'
      },
      {
        id: 'sunMass',
        name: 'Khối lượng sao chủ (M)',
        symbol: 'M',
        unit: 'M_sun',
        min: 0.5,
        max: 3.0,
        step: 0.1,
        defaultValue: 1.2,
        description: 'Khối lượng ngôi sao trung tâm chi phối lực hấp dẫn hút hành tinh.'
      },
      {
        id: 'tiltAngle',
        name: 'Độ nghiêng trục tự quay (tilt)',
        symbol: 'θ',
        unit: 'độ',
        min: 0,
        max: 45,
        step: 1,
        defaultValue: 23.5,
        description: 'Độ nghiêng trục quay của Trái Đất so với mặt phẳng hoàng đạo.'
      }
    ],
    initialParams: {
      orbitRadius: 4.0,
      sunMass: 1.2,
      tiltAngle: 23.5
    },
    cameraPosition: [0, 6, 9]
  },
  {
    id: 'ellipse-kepler',
    title: 'Hình Elip (Ellipse) → Định Luật Kepler & Quỹ Đạo Hành Tinh',
    shortDesc: 'Từ phương trình elip toán học suy ra 3 định luật Kepler, sự thay đổi vận tốc và bảo toàn mômen động lượng.',
    gradeLevel: 'Lớp 10',
    mathFormula: '\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1, \\quad c = \\sqrt{a^2 - b^2}, \\quad e = \\frac{c}{a} \\in [0, 1)',
    mathExplanation: 'Đường elip có 2 tiêu điểm F1 và F2. Bán trục lớn a, bán trục bé b. Độ lệch tâm e biểu thị độ dẹt của elip (e=0 là hình tròn).',
    physicsTopic: 'Vật lý 10: Chuyển động thiên thể & 3 Định luật Kepler',
    physicsFormula: 'r_{per} = a(1-e), \\; r_{ap} = a(1+e), \\; L = m r v_\\perp = \\text{const} \\implies r_{per} v_{per} = r_{ap} v_{ap}',
    physicsExplanation: 'Định luật 1 Kepler: Các hành tinh quay theo quỹ đạo elip với Mặt Trời tại một tiêu điểm. Định luật 2: Véc tơ bán kính quét những diện tích bằng nhau trong các khoảng thời gian bằng nhau -> Hành tinh chuyển động nhanh nhất tại cận điểm (Perihelion) và chậm nhất tại viễn điểm (Aphelion).',
    realWorldApp: 'Quỹ đạo sao chổi Halley (e=0.967), quỹ đạo các vệ tinh GPS, phi thuyền thám hiểm không gian chuyển tiếp quỹ đạo Hohmann.',
    parameters: [
      {
        id: 'semiMajor',
        name: 'Bán trục lớn (a)',
        symbol: 'a',
        unit: 'đơn vị',
        min: 2.5,
        max: 5.5,
        step: 0.1,
        defaultValue: 4.0,
        description: 'Chiều dài nửa trục dài của quỹ đạo elip.'
      },
      {
        id: 'eccentricity',
        name: 'Độ lệch tâm (e)',
        symbol: 'e',
        unit: '',
        min: 0.05,
        max: 0.85,
        step: 0.05,
        defaultValue: 0.55,
        description: 'Độ dẹt của elip. Càng gần 1 quỹ đạo càng dẹt.'
      },
      {
        id: 'centralMass',
        name: 'Khối lượng tâm hấp dẫn (M)',
        symbol: 'M',
        unit: 'đơn vị',
        min: 0.5,
        max: 3.0,
        step: 0.2,
        defaultValue: 1.5,
        description: 'Khối lượng ngôi sao đặt tại tiêu điểm F1.'
      }
    ],
    initialParams: {
      semiMajor: 4.0,
      eccentricity: 0.55,
      centralMass: 1.5
    },
    cameraPosition: [0, 7, 7]
  },
  {
    id: 'parabola-projectile',
    title: 'Hình Parabol → Chuyển Động Ném Xiên & Gương Hội Tụ',
    shortDesc: 'Từ phương trình parabol bậc 2 suy ra quỹ đạo ném xiên trong trường trọng lực và tính chất hội tụ tiêu điểm.',
    gradeLevel: 'Lớp 10',
    mathFormula: 'y = -\\frac{g}{2 v_0^2 \\cos^2\\alpha} x^2 + x \\tan\\alpha, \\quad \\text{Tiêu điểm } F(0, \\frac{1}{4a})',
    mathExplanation: 'Đường cong bậc 2 y = ax^2 + bx + c có bề lõm hướng xuống. Trong không gian 3D, quay parabol quanh trục đối xứng tạo nên mặt tròn xoay Paraboloid.',
    physicsTopic: 'Vật lý 10 & 11: Chuyển động ném xiên & Gương phản xạ anten Parabol',
    physicsFormula: 'H_{max} = \\frac{v_0^2 \\sin^2\\alpha}{2g}, \\quad L = \\frac{v_0^2 \\sin(2\\alpha)}{g}, \\quad \\vec{v}(t) = (v_0\\cos\\alpha, v_0\\sin\\alpha - gt)',
    physicsExplanation: 'Chuyển động ném xiên được phân tích thành 2 chuyển động độc lập: Theo phương ngang Ox là chuyển động thẳng đều; theo phương thẳng đứng Oy là chuyển động ném thẳng đứng chịu gia tốc trọng trường g. Vận tốc tiếp tuyến liên tục đổi hướng tạo nên quỹ đạo parabol.',
    realWorldApp: 'Quỹ đạo đường đạn pháo xạ kích, ném bóng rổ (góc 45° cho tầm xa nhất), anten chảo vệ tinh thu sóng hội tụ tại tiêu điểm thu LNB.',
    parameters: [
      {
        id: 'v0',
        name: 'Vận tốc ném ban đầu (v₀)',
        symbol: 'v₀',
        unit: 'm/s',
        min: 5,
        max: 25,
        step: 1,
        defaultValue: 14,
        description: 'Độ lớn vận tốc phóng ban đầu của vật.'
      },
      {
        id: 'angle',
        name: 'Góc ném (α)',
        symbol: 'α',
        unit: 'độ',
        min: 15,
        max: 85,
        step: 5,
        defaultValue: 45,
        description: 'Góc nghiêng hợp bởi véc tơ vận tốc ban đầu và mặt phẳng ngang.'
      },
      {
        id: 'gravity',
        name: 'Gia tốc trọng trường (g)',
        symbol: 'g',
        unit: 'm/s²',
        min: 1.6,
        max: 15.0,
        step: 0.2,
        defaultValue: 9.8,
        description: 'Gia tốc rơi tự do (9.8: Trái Đất, 1.6: Mặt Trăng, 3.7: Sao Hỏa).'
      }
    ],
    initialParams: {
      v0: 14,
      angle: 45,
      gravity: 9.8
    },
    cameraPosition: [0, 4, 12]
  },
  {
    id: 'helix-lorentz',
    title: 'Đường Xoắn Ốc Helix (Trụ) → Hạt Điện Tích Trong Từ Trường',
    shortDesc: 'Từ đường xoắn ốc hình trụ 3D suy ra quỹ đạo của hạt tích điện dưới tác dụng của lực từ Lorentz.',
    gradeLevel: 'Lớp 11',
    mathFormula: 'x(t) = R\\cos(\\omega t), \\; y(t) = R\\sin(\\omega t), \\; z(t) = v_z t, \\quad \\text{Bước xoắn } h = v_z T',
    mathExplanation: 'Đường xoắn ốc đều (Helix) nằm trên mặt trụ tròn bán kính R. Tọa độ (x,y) quay tròn đều trong khi toạ độ z chuyển động thẳng đều.',
    physicsTopic: 'Vật lý 11: Lực Lorentz & Chuyển động hạt tích điện trong từ trường đều',
    physicsFormula: '\\vec{F}_L = q(\\vec{v} \\times \\vec{B}), \\quad R = \\frac{m v_\\perp}{|q| B} = \\frac{m v\\sin\\alpha}{|q| B}, \\quad h = v\\cos\\alpha \\cdot \\frac{2\\pi m}{|q| B}',
    physicsExplanation: 'Khi hạt tích điện bay vào từ trường đều với vận tốc hợp góc α với vectơ B, lực Lorentz luôn vuông góc với vận tốc nên không sinh công. Thành phần song song v_parallel không đổi -> chuyển động thẳng đều. Thành phần vuông góc v_perp tạo chuyển động tròn đều -> Quỹ đạo tổng hợp là đường xoắn ốc 3D!',
    realWorldApp: 'Máy gia tốc hạt cyclotron, vành đai bức xạ Van Allen bảo vệ Trái Đất, hiện tượng cực quang tuyệt đẹp (Aurora) ở hai cực Bắc - Nam.',
    parameters: [
      {
        id: 'velocity',
        name: 'Vận tốc hạt (v)',
        symbol: 'v',
        unit: 'đơn vị',
        min: 2,
        max: 10,
        step: 0.5,
        defaultValue: 5,
        description: 'Tốc độ bay ban đầu của hạt tích điện.'
      },
      {
        id: 'pitchAngle',
        name: 'Góc bay so với từ trường (α)',
        symbol: 'α',
        unit: 'độ',
        min: 10,
        max: 85,
        step: 5,
        defaultValue: 45,
        description: 'Góc hợp bởi vectơ vận tốc v và vectơ cảm ứng từ B (z-axis).'
      },
      {
        id: 'bField',
        name: 'Cảm ứng từ (B)',
        symbol: 'B',
        unit: 'Tesla (quy đổi)',
        min: 0.5,
        max: 4.0,
        step: 0.2,
        defaultValue: 1.5,
        description: 'Độ mạnh của từ trường đều hướng dọc trục Z.'
      }
    ],
    initialParams: {
      velocity: 5,
      pitchAngle: 45,
      bField: 1.5
    },
    cameraPosition: [4, 5, 8]
  },
  {
    id: 'sine-harmonic',
    title: 'Hàm Sin & Vòng Tròn Pha → Dao Động Điều Hòa (Fresnel)',
    shortDesc: 'Từ hình chiếu đường tròn lên trục toạ độ suy ra dao động điều hòa con lắc lò xo và đồ thị li độ sin.',
    gradeLevel: 'Lớp 12',
    mathFormula: 'x(t) = A \\cos(\\omega t + \\varphi), \\quad v(t) = -\\omega A \\sin(\\omega t + \\varphi), \\quad a(t) = -\\omega^2 x(t)',
    mathExplanation: 'Hình chiếu vuông góc của một chất điểm chuyển động tròn đều trên một đường kính là một dao động điều hòa với hàm sin / cos.',
    physicsTopic: 'Vật lý 12: Dao động cơ, con lắc lò xo & Bảo toàn cơ năng',
    physicsFormula: 'W = W_đ + W_t = \\frac{1}{2}mv^2 + \\frac{1}{2}kx^2 = \\frac{1}{2}kA^2 = \\text{const}',
    physicsExplanation: 'Khi chất điểm quay tròn với bán kính A, hình chiếu của nó dao động qua lại quanh gốc tọa độ. Khi qua VTCB (x=0), thế năng bằng 0 và động năng cực đại; khi ở biên (x=±A), động năng bằng 0 và thế năng cực đại. Tổng cơ năng được bảo toàn không đổi theo thời gian.',
    realWorldApp: 'Hệ thống giảm xóc ô tô xe máy, đồng hồ quả lắc, mạch dao động điện từ LC tạo sóng radio và truyền thông 5G.',
    parameters: [
      {
        id: 'amplitude',
        name: 'Biên độ dao động (A)',
        symbol: 'A',
        unit: 'm',
        min: 0.5,
        max: 3.0,
        step: 0.1,
        defaultValue: 1.8,
        description: 'Độ lệch cực đại của vật so với vị trí cân bằng (bán kính vòng tròn Fresnel).'
      },
      {
        id: 'freq',
        name: 'Tần số góc (ω)',
        symbol: 'ω',
        unit: 'rad/s',
        min: 0.5,
        max: 4.0,
        step: 0.1,
        defaultValue: 1.5,
        description: 'Tốc độ biến thiên pha dao động.'
      },
      {
        id: 'initialPhase',
        name: 'Pha ban đầu (φ)',
        symbol: 'φ',
        unit: 'rad',
        min: 0,
        max: 3.14,
        step: 0.1,
        defaultValue: 0,
        description: 'Góc pha tại thời điểm t = 0.'
      }
    ],
    initialParams: {
      amplitude: 1.8,
      freq: 1.5,
      initialPhase: 0
    },
    cameraPosition: [0, 4, 7]
  },
  {
    id: 'custom-parametric',
    title: 'Phòng Thí Nghiệm Tham Số Tự Do 3D (Parametric Lab)',
    shortDesc: 'Tự nhập và điều chỉnh các hàm toán học x(t), y(t), z(t) để khảo sát quỹ đạo không gian và vector động lực học.',
    gradeLevel: 'Toán - Lý 10-12',
    mathFormula: '\\vec{r}(t) = \\left( x(t), \\, y(t), \\, z(t) \\right), \\quad \\vec{v} = \\frac{d\\vec{r}}{dt}, \\quad \\vec{a} = \\frac{d^2\\vec{r}}{dt^2}',
    mathExplanation: 'Phương trình tham số 3D xác định một đường cong không gian trơn. Đạo hàm bậc 1 là vector tiếp tuyến (vận tốc), đạo hàm bậc 2 là vector gia tốc.',
    physicsTopic: 'Cơ học giải tích 10-12: Động học & Động lực học chất điểm trong không gian',
    physicsFormula: '\\vec{F}_{hợp\\_lực} = m\\vec{a} = m \\frac{d^2\\vec{r}}{dt^2}, \\quad v = \\sqrt{x\'^2 + y\'^2 + z\'^2}',
    physicsExplanation: 'Theo định luật II Newton, để hạt chuyển động theo bất kỳ quỹ đạo không gian nào, lực tổng hợp tác dụng lên hạt tại mọi thời điểm phải bằng m * a(t). Bằng cách khảo sát vector gia tốc, ta biết chính xác hướng lực cưỡng bức cần thiết!',
    realWorldApp: 'Thiết kế quỹ đạo tàu thám hiểm không gian (Gravity assist), cánh tay robot công nghiệp 6 bậc tự do, chuyển động máy bay nhào lộn.',
    parameters: [
      {
        id: 'scaleA',
        name: 'Hệ số biên độ A',
        symbol: 'A',
        unit: '',
        min: 0.5,
        max: 4.0,
        step: 0.2,
        defaultValue: 2.0,
        description: 'Hệ số tỉ lệ độ dãn không gian theo phương X.'
      },
      {
        id: 'scaleB',
        name: 'Hệ số biên độ B',
        symbol: 'B',
        unit: '',
        min: 0.5,
        max: 4.0,
        step: 0.2,
        defaultValue: 2.0,
        description: 'Hệ số tỉ lệ độ dãn không gian theo phương Y.'
      },
      {
        id: 'paramSpeed',
        name: 'Tốc độ tham số (t)',
        symbol: 'k',
        unit: 'rad/s',
        min: 0.5,
        max: 3.0,
        step: 0.1,
        defaultValue: 1.2,
        description: 'Tốc độ biến thiên tham số thời gian.'
      }
    ],
    initialParams: {
      scaleA: 2.0,
      scaleB: 2.0,
      paramSpeed: 1.2
    },
    cameraPosition: [0, 5, 8]
  }
];

export const TOPIC_QUIZZES: Record<string, QuizQuestion[]> = {
  'circle-wheel': [
    {
      id: 'cw-1',
      question: 'Trong chuyển động lăn không trượt của bánh xe bán kính R trên đường thẳng với vận tốc tâm v₀, vận tốc tức thời của điểm tiếp xúc với mặt đất bằng bao nhiêu?',
      options: [
        'A. v = v₀',
        'B. v = 0',
        'C. v = 2v₀',
        'D. v = v₀ / 2'
      ],
      correctIndex: 1,
      explanation: 'Vận tốc của điểm tiếp xúc bằng v_tịnh_tiến + v_quay. Vì lăn không trượt, vận tốc quay v_q = -v₀ hướng ngược chiều chuyển động nên tổng vận tốc tức thời bằng 0. Điểm này gọi là tâm quay tức thời.',
      tip: 'Quan sát vector vận tốc tại chân bánh xe trên mô phỏng: mũi tên thu gọn về 0.'
    },
    {
      id: 'cw-2',
      question: 'Quỹ đạo của một điểm nằm trên vành bánh xe khi lăn không trượt trên mặt phẳng ngang là đường cong nào?',
      options: [
        'A. Đường tròn',
        'B. Đường Parabol',
        'C. Đường Cycloid',
        'D. Đường Elip'
      ],
      correctIndex: 2,
      explanation: 'Đường sinh ra từ một điểm trên đường tròn lăn dọc trên một đường thẳng gọi là đường Cycloid. Tại đỉnh chu kỳ, điểm có vận tốc gấp đôi vận tốc tâm xe (2v₀).',
      tip: 'Bật tùy chọn "Đường vết quỹ đạo (Trail)" để thấy rõ hình dáng đường cong.'
    }
  ],
  'circle-earth': [
    {
      id: 'ce-1',
      question: 'Lực nào đóng vai trò là lực hướng tâm giữ cho Trái Đất chuyển động trên quỹ đạo xấp xỉ tròn quanh Mặt Trời?',
      options: [
        'A. Lực ma sát vũ trụ',
        'B. Lực điện từ',
        'C. Lực vạn vật hấp dẫn giữa Mặt Trời và Trái Đất',
        'D. Lực ly tâm của Trái Đất'
      ],
      correctIndex: 2,
      explanation: 'Theo định luật vạn vật hấp dẫn Newton, lực hút hấp dẫn F_hd = G*(M*m)/r² luôn hướng về tâm Mặt Trời, đóng vai trò lực hướng tâm sinh ra gia tốc a_ht = v²/r.',
      tip: 'Véc tơ lực hấp dẫn luôn hướng dọc đường nối hai tâm vật thể.'
    },
    {
      id: 'ce-2',
      question: 'Nếu bán kính quỹ đạo r tăng lên 4 lần, theo định luật III Kepler chu kỳ quay T của hành tinh sẽ thay đổi như thế nào?',
      options: [
        'A. Tăng 2 lần',
        'B. Tăng 4 lần',
        'C. Tăng 8 lần',
        'D. Không đổi'
      ],
      correctIndex: 2,
      explanation: 'Theo định luật 3 Kepler: T² / r³ = hằng số, suy ra T tỉ lệ với r^(3/2). Khi r tăng 4 lần thì T tăng 4^(3/2) = 8 lần.',
      tip: 'Công thức T = 2π * sqrt(r³ / GM).'
    }
  ],
  'ellipse-kepler': [
    {
      id: 'ek-1',
      question: 'Theo định luật II Kepler (định luật diện tích), hành tinh chuyển động có vận tốc lớn nhất tại vị trí nào trên quỹ đạo elip?',
      options: [
        'A. Cận điểm (vị trí gần Mặt Trời nhất)',
        'B. Viễn điểm (vị trí xa Mặt Trời nhất)',
        'C. Hai đầu bán trục bé',
        'D. Vận tốc luôn bằng hằng số không đổi'
      ],
      correctIndex: 0,
      explanation: 'Do diện tích quét trong cùng khoảng thời gian là không đổi (bảo toàn mômen động lượng L = m*r*v = hằng số), khi bán kính r nhỏ nhất (cận điểm Perihelion) thì vận tốc v đạt giá trị cực đại v_max.',
      tip: 'Quan sát vector vận tốc v vọt lên dài nhất khi hành tinh áp sát Mặt Trời.'
    }
  ],
  'parabola-projectile': [
    {
      id: 'pp-1',
      question: 'Trong chuyển động ném xiên bỏ qua sức cản không khí, đại lượng nào sau đây không đổi trong suốt quá trình chuyển động?',
      options: [
        'A. Độ lớn vận tốc tức thời v',
        'B. Thành phần vận tốc theo phương ngang v_x',
        'C. Thành phần vận tốc theo phương thẳng đứng v_y',
        'D. Động năng của vật'
      ],
      correctIndex: 1,
      explanation: 'Vì theo phương ngang không có lực tác dụng (F_x = 0, gia tốc a_x = 0), nên thành phần vận tốc ngang v_x = v₀*cos(α) luôn là hằng số không đổi.',
      tip: 'Quan sát thành phần vector màu xanh lục nằm ngang giữ nguyên độ dài.'
    }
  ],
  'helix-lorentz': [
    {
      id: 'hl-1',
      question: 'Công của lực từ Lorentz tác dụng lên hạt điện tích chuyển động trong từ trường đều bằng bao nhiêu?',
      options: [
        'A. Luôn luôn bằng 0',
        'B. Luôn dương làm tăng động năng của hạt',
        'C. Bằng q*v*B',
        'D. Phụ thuộc vào góc bay α'
      ],
      correctIndex: 0,
      explanation: 'Vì lực Lorentz F_L = q(v x B) luôn có phương vuông góc với véc tơ vận tốc v tại mọi thời điểm, nên công A = F*s*cos(90°) = 0. Lực Lorentz chỉ làm đổi hướng chuyển động mà không làm biến đổi động năng của hạt.',
      tip: 'Lực hướng tâm không sinh công!'
    }
  ],
  'sine-harmonic': [
    {
      id: 'sh-1',
      question: 'Một chất điểm dao động điều hòa qua vị trí cân bằng thì đại lượng nào sau đây đạt giá trị cực đại?',
      options: [
        'A. Thế năng',
        'B. Gia tốc',
        'C. Độ lớn vận tốc',
        'D. Li độ'
      ],
      correctIndex: 2,
      explanation: 'Tại vị trí cân bằng (x = 0), thế năng W_t = 0, li độ x = 0, gia tốc a = -ω²*x = 0; toàn bộ cơ năng chuyển hóa thành động năng nên vận tốc đạt cực đại v_max = ω*A.',
      tip: 'Theo dõi thanh đo năng lượng: động năng chuyển màu cam rực rỡ khi qua tâm.'
    }
  ]
};
