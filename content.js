/* Mama Journey — bilingual content. Every text is {ar, en}. Figures follow the sources listed in SOURCES. */
window.MJ = {};

/* Approximate fetal size by week (length: crown-rump to w19, crown-heel from w20). */
MJ.FETAL = [
  { w: 4,  ar: 'بذرة خشخاش', en: 'a poppy seed', cm: 0.1, g: null, e: '·' },
  { w: 5,  ar: 'حبة سمسم', en: 'a sesame seed', cm: 0.2, g: null, e: '·' },
  { w: 6,  ar: 'حبة عدس', en: 'a lentil', cm: 0.5, g: null, e: '•' },
  { w: 7,  ar: 'حبة توت أزرق', en: 'a blueberry', cm: 1.0, g: null, e: '•' },
  { w: 8,  ar: 'حبة توت العليق', en: 'a raspberry', cm: 1.6, g: 1, e: '●' },
  { w: 9,  ar: 'حبة عنب', en: 'a grape', cm: 2.3, g: 2, e: '●' },
  { w: 10, ar: 'تمرة', en: 'a date', cm: 3.1, g: 4, e: '●' },
  { w: 11, ar: 'تينة', en: 'a fig', cm: 4.1, g: 7, e: '●' },
  { w: 12, ar: 'ليمونة صغيرة', en: 'a lime', cm: 5.4, g: 14, e: '●' },
  { w: 13, ar: 'خوخة', en: 'a peach', cm: 7.4, g: 23, e: '●' },
  { w: 14, ar: 'ليمونة', en: 'a lemon', cm: 8.7, g: 43, e: '●' },
  { w: 16, ar: 'حبة أفوكادو', en: 'an avocado', cm: 11.6, g: 100, e: '●' },
  { w: 18, ar: 'فلفل رومي', en: 'a bell pepper', cm: 14.2, g: 190, e: '●' },
  { w: 20, ar: 'موزة', en: 'a banana', cm: 25.6, g: 300, e: '●' },
  { w: 22, ar: 'حبة مانجو', en: 'a mango', cm: 27.8, g: 430, e: '●' },
  { w: 24, ar: 'كوز ذرة', en: 'an ear of corn', cm: 30.0, g: 600, e: '●' },
  { w: 26, ar: 'رأس خس', en: 'a head of lettuce', cm: 35.6, g: 760, e: '●' },
  { w: 28, ar: 'باذنجانة', en: 'an eggplant', cm: 37.6, g: 1000, e: '●' },
  { w: 30, ar: 'ملفوفة', en: 'a cabbage', cm: 39.9, g: 1300, e: '●' },
  { w: 32, ar: 'قرعة', en: 'a squash', cm: 42.4, g: 1700, e: '●' },
  { w: 34, ar: 'شمامة', en: 'a cantaloupe', cm: 45.0, g: 2100, e: '●' },
  { w: 36, ar: 'حبة بابايا', en: 'a papaya', cm: 47.4, g: 2600, e: '●' },
  { w: 38, ar: 'يقطينة صغيرة', en: 'a small pumpkin', cm: 49.8, g: 3100, e: '●' },
  { w: 40, ar: 'بطيخة صغيرة', en: 'a small watermelon', cm: 51.2, g: 3400, e: '●' }
];

/* Antenatal schedule: start/end in completed weeks. */
MJ.PRENATAL = [
  { id: 'first', s: 6, e: 12,
    t: { ar: 'أول زيارة حمل وسونار تحديد العمر', en: 'First antenatal visit and dating scan' },
    d: { ar: 'تحاليل: صورة الدم CBC، فصيلة الدم وRh والأجسام المضادة، مناعة الروبيلا، التهاب الكبد ب، HIV، الزهري، تحليل وزراعة البول، والسكر أو HbA1c إذا فيه عوامل خطر.',
         en: 'Tests: CBC, blood group, Rh and antibody screen, rubella immunity, hepatitis B, HIV, syphilis, urine analysis and culture, and glucose or HbA1c if at risk.' } },
  { id: 'nt', s: 11, e: 14,
    t: { ar: 'فحص الثلث الأول (الشفافية القفوية)', en: 'First-trimester screening (nuchal translucency)' },
    d: { ar: 'سونار وتحليل دم للتحري المبكر عن الاضطرابات الكروموسومية، حسب توفره ورغبتك.', en: 'Scan and blood test to screen for chromosomal conditions, where offered and if you choose.' } },
  { id: 'anomaly', s: 18, e: 22,
    t: { ar: 'سونار التشوهات (المسح التفصيلي)', en: 'Anomaly scan (detailed scan)' },
    d: { ar: 'فحص تفصيلي لأعضاء الجنين ونموه والمشيمة.', en: 'Detailed check of baby’s organs, growth and the placenta.' } },
  { id: 'ogtt', s: 24, e: 28,
    t: { ar: 'تحليل سكر الحمل OGTT وصورة الدم', en: 'Glucose tolerance test (OGTT) and CBC' },
    d: { ar: 'تحليل تحمّل الجلوكوز بـ75 غرامًا بعد الصيام، مع تكرار الهيموغلوبين.', en: '75 g glucose tolerance test after fasting, with a repeat haemoglobin.' } },
  { id: 'antid', s: 28, e: 28,
    t: { ar: 'إبرة Anti-D لفصيلة Rh السالبة', en: 'Anti-D injection if Rh-negative' },
    d: { ar: 'فقط إذا كانت فصيلة دمك سالبة، وفق تقييم الطبيب.', en: 'Only if your blood group is Rh-negative, as your doctor advises.' } },
  { id: 'tdap', s: 27, e: 36,
    t: { ar: 'تطعيم السعال الديكي Tdap', en: 'Whooping cough vaccine (Tdap)' },
    d: { ar: 'جرعة مع كل حمل بين الأسبوع 27 و36 حسب جدول وزارة الصحة، تحمي المولود في أول أشهره.', en: 'One dose each pregnancy between weeks 27 and 36 (MOH schedule), protecting baby in the first months.' } },
  { id: 'gbs', s: 36, e: 37,
    t: { ar: 'مسحة البكتيريا العقدية GBS', en: 'Group B strep (GBS) swab' },
    d: { ar: 'مسحة مهبلية وشرجية، وإذا كانت إيجابية تحصلين على مضاد حيوي أثناء الولادة.', en: 'Vaginal-rectal swab; if positive you get antibiotics in labour.' } },
  { id: 'birthplan', s: 34, e: 37,
    t: { ar: 'تجهيز حقيبة المستشفى وخطة الولادة', en: 'Hospital bag and birth plan' },
    d: { ar: 'الهوية والملف الطبي، وملابس لكِ وللمولود، ومقعد السيارة، وأرقام التواصل.', en: 'ID and medical file, clothes for you and baby, car seat, and contact numbers.' } },
  { id: 'postdates', s: 40, e: 41,
    t: { ar: 'تقييم تجاوز الموعد', en: 'Going-past-due assessment' },
    d: { ar: 'متابعة حركة الجنين والسائل، ومناقشة خطة الولادة عند تجاوز الموعد.', en: 'Checks on movements and fluid, and a plan if you go past your due date.' } }
];

MJ.PRECONCEPTION = [
  { id: 'folic', t: { ar: 'البدء بحمض الفوليك 400 ميكروغرام يوميًا', en: 'Started folic acid 400 mcg daily' }, d: { ar: 'قبل الحمل بثلاثة أشهر على الأقل، والجرعة أعلى لمن عندها تاريخ عيوب الأنبوب العصبي حسب الطبيب.', en: 'At least 3 months before conception; higher dose if advised (e.g. previous neural tube defect).' } },
  { id: 'premarital', t: { ar: 'فحص ما قبل الزواج', en: 'Premarital screening' }, d: { ar: 'فقر الدم المنجلي والثلاسيميا والتهاب الكبد ب وج وHIV.', en: 'Sickle cell, thalassaemia, hepatitis B and C, HIV.' } },
  { id: 'cbc', t: { ar: 'صورة الدم CBC والفيريتين', en: 'CBC and ferritin' }, d: { ar: 'للكشف عن فقر الدم ونقص مخزون الحديد قبل الحمل.', en: 'To detect anaemia and low iron stores before pregnancy.' } },
  { id: 'group', t: { ar: 'فصيلة الدم وRh', en: 'Blood group and Rh' }, d: { ar: 'مهمة لمتابعة الحمل إذا كانت الفصيلة سالبة.', en: 'Important for pregnancy care if Rh-negative.' } },
  { id: 'rubella', t: { ar: 'مناعة الروبيلا (الحصبة الألمانية)', en: 'Rubella immunity' }, d: { ar: 'عند عدم وجود مناعة: التطعيم وتأجيل الحمل شهرًا على الأقل بعده.', en: 'If not immune: vaccinate and avoid pregnancy for at least 1 month after.' } },
  { id: 'sugar', t: { ar: 'السكر التراكمي HbA1c', en: 'HbA1c (blood sugar)' }, d: { ar: 'خصوصًا مع زيادة الوزن أو تاريخ عائلي للسكري.', en: 'Especially with overweight or family history of diabetes.' } },
  { id: 'tsh', t: { ar: 'الغدة الدرقية TSH', en: 'Thyroid (TSH)' }, d: { ar: 'اضطراب الغدة يؤثر في الخصوبة والحمل.', en: 'Thyroid problems affect fertility and pregnancy.' } },
  { id: 'vitd', t: { ar: 'فيتامين د', en: 'Vitamin D' }, d: { ar: 'نقصه شائع في المملكة.', en: 'Deficiency is common in Saudi Arabia.' } },
  { id: 'meds', t: { ar: 'مراجعة الأدوية مع الطبيب', en: 'Review medicines with your doctor' }, d: { ar: 'بعض أدوية الصرع والضغط وحب الشباب تحتاج إلى تعديل قبل الحمل.', en: 'Some epilepsy, blood pressure and acne medicines need changing before pregnancy.' } },
  { id: 'dental', t: { ar: 'فحص الأسنان واللثة', en: 'Dental check' }, d: { ar: 'علاج التسوس والتهاب اللثة أسهل قبل الحمل.', en: 'Treating decay and gum disease is easier before pregnancy.' } },
  { id: 'weight', t: { ar: 'الوصول إلى وزن صحي والنشاط البدني', en: 'Healthy weight and activity' }, d: { ar: 'مؤشر كتلة جسم بين 18.5 و24.9 يقلل مضاعفات الحمل.', en: 'A BMI of 18.5–24.9 lowers pregnancy complications.' } },
  { id: 'smoke', t: { ar: 'الإقلاع عن التدخين والشيشة', en: 'Stop smoking and shisha' }, d: { ar: 'ويشمل ذلك التدخين السلبي في المنزل.', en: 'Including second-hand smoke at home.' } }
];

/* Tips shown on the dashboard by gestational week. */
MJ.WEEK_TIPS = [
  { from: 0, to: 13, ar: ['استمري في تناول حمض الفوليك يوميًا حتى نهاية الأسبوع 12.', 'للتخفيف من الغثيان: وجبات صغيرة كل ساعتين إلى ثلاث، وبسكويت جاف قبل النهوض من السرير.', 'احجزي موعد الزيارة الأولى وسونار تحديد عمر الحمل.'],
    en: ['Keep taking folic acid daily until the end of week 12.', 'For nausea: small meals every 2–3 hours and dry crackers before getting up.', 'Book your first antenatal visit and dating scan.'] },
  { from: 14, to: 27, ar: ['ابدئي تمارين قاع الحوض (كيجل) ثلاث مرات يوميًا.', 'موعد سونار التشوهات بين الأسبوعين 18 و22.', 'موعد تحليل سكر الحمل بين الأسبوعين 24 و28.'],
    en: ['Start pelvic floor (Kegel) exercises three times a day.', 'Anomaly scan between weeks 18 and 22.', 'Glucose test between weeks 24 and 28.'] },
  { from: 28, to: 36, ar: ['تعرّفي على النمط المعتاد لحركة جنينك، وأي انخفاض واضح يستدعي التواصل مع المستشفى في اليوم نفسه.', 'من الأسبوع 28 نامي على أحد جانبيكِ.', 'تطعيم السعال الديكي (Tdap) بين الأسبوعين 27 و36.'],
    en: ['Learn your baby\u2019s usual movement pattern; any clear decrease needs a same-day call to the hospital.', 'From week 28, go to sleep on your side (either side).', 'Tdap vaccine between weeks 27 and 36.'] },
  { from: 37, to: 43, ar: ['قاعدة 5-1-1: انقباضة كل 5 دقائق، مدتها دقيقة، لمدة ساعة، تعني أن وقت التوجه إلى المستشفى قد حان (في الولادة الأولى).', 'عند نزول الماء أو النزيف أو قلة حركة الجنين توجّهي إلى المستشفى فورًا.', 'جهّزي حقيبة المستشفى ومقعد السيارة.'],
    en: ['5-1-1 rule: contractions every 5 minutes, lasting 1 minute, for 1 hour means hospital time (first baby).', 'Waters breaking, bleeding or fewer movements: go to hospital now.', 'Have your hospital bag and car seat ready.'] }
];

/* Triage: home / clinic / er. null = this condition does not wait. */
MJ.TRIAGE = [
  { id: 'nausea', g: 'preg', k: 'nausea vomiting غثيان قيء استفراغ لوعة',
    t: { ar: 'الغثيان والقيء', en: 'Nausea and vomiting' },
    home: { ar: 'تناول وجبات صغيرة كل ساعتين إلى ثلاث ساعات، وبسكويت جاف قبل النهوض من السرير، وشرب السوائل بين الوجبات، ويمكن الاستعانة بالزنجبيل.', en: 'Small meals every 2–3 hours, dry crackers before getting up, fluids between meals, and ginger.' },
    clinic: { ar: 'قيء يومي يمنع تناول الطعام، أو نقص في الوزن.', en: 'Daily vomiting that stops you eating, or weight loss.' },
    er: { ar: 'عدم القدرة على الاحتفاظ بأي سوائل لأكثر من 24 ساعة، أو بول داكن أو قليل جدًا، أو دوار شديد، أو دم في القيء.', en: 'Unable to keep any fluids down for over 24 hours, very dark or little urine, severe dizziness, or blood in vomit.' } },
  { id: 'heartburn', g: 'preg', k: 'heartburn constipation حموضة حرقة إمساك',
    t: { ar: 'الحموضة والإمساك', en: 'Heartburn and constipation' },
    home: { ar: 'وجبات صغيرة، وتجنب الأكل قبل النوم بساعتين، ورفع الرأس أثناء النوم، والإكثار من الألياف والسوائل مع المشي اليومي.', en: 'Small meals, no food 2 hours before bed, raise your head in bed, plenty of fibre, fluids and a daily walk.' },
    clinic: { ar: 'عدم تحسن الأعراض مع هذه الإجراءات، أو الحاجة إلى دواء (يُستشار الطبيب قبل أي دواء).', en: 'Symptoms that do not improve, or you need medicine (ask before taking any).' },
    er: { ar: 'ألم شديد في أعلى البطن أو تحت الأضلاع اليمنى، خاصة إذا صاحبه صداع أو ارتفاع في ضغط الدم.', en: 'Severe pain in the upper abdomen or under the right ribs, especially with headache or high blood pressure.' } },
  { id: 'headache', g: 'preg', k: 'headache vision صداع زغللة نظر ضغط',
    t: { ar: 'الصداع', en: 'Headache' },
    home: { ar: 'الراحة وشرب السوائل وانتظام الوجبات. يُستخدم الباراسيتامول بالجرعة المدونة على العبوة فقط إذا أذن الطبيب.', en: 'Rest, fluids and regular meals. Paracetamol at the labelled dose only if your doctor allows.' },
    clinic: { ar: 'صداع متكرر أو لا يزول بالراحة.', en: 'Frequent headache, or one that rest does not relieve.' },
    er: { ar: 'بعد الأسبوع 20: صداع شديد مع تشوش الرؤية أو ومضات ضوئية، أو ألم في أعلى البطن، أو ضغط دم 140/90 فأعلى. هذه من علامات تسمم الحمل.', en: 'After week 20: severe headache with blurred vision or flashing lights, upper abdominal pain, or BP 140/90 or higher. These are signs of pre-eclampsia.' } },
  { id: 'swelling', g: 'preg', k: 'swelling oedema edema تورم انتفاخ رجل وجه',
    t: { ar: 'التورم', en: 'Swelling' },
    home: { ar: 'التورم الخفيف في القدمين آخر اليوم أمر طبيعي: يُنصح برفع القدمين والمشي وتقليل الوقوف لفترات طويلة.', en: 'Mild foot swelling at day’s end is normal: raise your feet, walk, and avoid long standing.' },
    clinic: { ar: 'تورم يزداد تدريجيًا خلال أيام.', en: 'Swelling that increases over days.' },
    er: { ar: 'تورم مفاجئ في الوجه أو اليدين، خاصة مع صداع أو تشوش في الرؤية، أو تورم في ساق واحدة مع ألم واحمرار.', en: 'Sudden swelling of the face or hands, especially with headache or blurred vision. Or one swollen, painful, red leg.' } },
  { id: 'movement', g: 'preg', k: 'movement kicks reduced حركة الجنين قلة نقص ركلات',
    t: { ar: 'قلة حركة الجنين', en: 'Fewer baby movements' },
    home: { ar: 'من الأسبوع 28 يُنصح بالتعرف على النمط المعتاد لحركة الجنين، والاستلقاء على الجنب وعدّ الحركات باستخدام عدّاد الحركة.', en: 'From week 28 learn your baby’s usual pattern. Lie on your side and count with the kick counter.' },
    clinic: null,
    er: { ar: 'قلة الحركة عن المعتاد أو توقفها، أو أقل من 10 حركات خلال ساعتين: يجب التواصل مع المستشفى في اليوم نفسه دون الانتظار لليوم التالي.', en: 'Movements less than usual or stopped, or fewer than 10 in 2 hours: contact the hospital the same day; do not wait until tomorrow.' } },
  { id: 'bleeding', g: 'preg', k: 'bleeding spotting fluid waters نزيف تبقيع دم ماء سائل',
    t: { ar: 'النزيف أو نزول ماء', en: 'Bleeding or leaking fluid' },
    home: null,
    clinic: { ar: 'تبقيع خفيف جدًا دون ألم في بداية الحمل: يُبلَّغ الطبيب خلال يوم.', en: 'Very light spotting without pain in early pregnancy: tell your doctor within a day.' },
    er: { ar: 'أي نزيف أحمر، أو نزيف مصحوب بألم أو تقلصات، أو نزول ماء أو سائل بشكل مستمر.', en: 'Any red bleeding, bleeding with pain or cramps, or a gush or steady leak of fluid.' } },
  { id: 'preterm', g: 'preg', k: 'contractions preterm labour طلق مبكر انقباضات شد',
    t: { ar: 'انقباضات قبل الموعد', en: 'Contractions before term' },
    home: { ar: 'شد خفيف غير منتظم يزول بالراحة وشرب الماء (انقباضات براكستون هيكس).', en: 'Mild, irregular tightening that settles with rest and water (Braxton Hicks).' },
    clinic: null,
    er: { ar: 'قبل الأسبوع 37: انقباضات منتظمة (4 فأكثر في الساعة)، أو ضغط في الحوض، أو ألم منتظم أسفل الظهر، أو نزول ماء.', en: 'Before week 37: regular contractions (4 or more an hour), pelvic pressure, rhythmic low back pain, or leaking fluid.' } },
  { id: 'uti', g: 'preg', k: 'urine burning fever uti حرقان بول حرارة التهاب',
    t: { ar: 'حرقان البول والحرارة', en: 'Burning urine and fever' },
    home: { ar: 'الإكثار من السوائل وعدم حبس البول.', en: 'Plenty of fluids and do not hold urine.' },
    clinic: { ar: 'حرقان أو كثرة التبول، أو حرارة أقل من 38 درجة.', en: 'Burning or frequent urination, or a temperature below 38 °C.' },
    er: { ar: 'حرارة 38 درجة فأعلى مع قشعريرة، أو ألم في الخاصرة أو الظهر، أو قيء.', en: 'Temperature 38 °C or higher with shivering, flank or back pain, or vomiting.' } },
  { id: 'itch', g: 'preg', k: 'itching itch cholestasis حكة هرش ركود صفراوي',
    t: { ar: 'الحكة', en: 'Itching' },
    home: { ar: 'حكة خفيفة في البطن نتيجة التمدد: الترطيب وارتداء الملابس القطنية.', en: 'Mild belly itching from stretching: moisturise and wear cotton.' },
    clinic: { ar: 'حكة شديدة في الكفين والقدمين تزداد ليلًا: تلزم المراجعة في اليوم نفسه لتحليل الأحماض الصفراوية (الركود الصفراوي الحملي).', en: 'Intense itching of palms and soles, worse at night: be seen the same day for a bile acid test (cholestasis of pregnancy).' },
    er: { ar: 'حكة مع اصفرار العينين أو بول داكن جدًا.', en: 'Itching with yellow eyes or very dark urine.' } },
  { id: 'dizzy', g: 'preg', k: 'dizziness fainting palpitations دوخة إغماء خفقان',
    t: { ar: 'الدوار والإغماء', en: 'Dizziness and fainting' },
    home: { ar: 'النهوض ببطء، وشرب السوائل، وتناول وجبات صغيرة منتظمة.', en: 'Stand up slowly, drink fluids and eat small regular meals.' },
    clinic: { ar: 'دوار متكرر: يُفحص الهيموغلوبين وضغط الدم.', en: 'Repeated dizziness: check your haemoglobin and blood pressure.' },
    er: { ar: 'إغماء، أو ألم في الصدر، أو ضيق في التنفس، أو خفقان شديد.', en: 'Fainting, chest pain, shortness of breath or severe palpitations.' } },
  { id: 'fall', g: 'preg', k: 'fall accident trauma سقوط حادث ضربة',
    t: { ar: 'السقوط أو التعرض لحادث', en: 'A fall or accident' },
    home: null,
    clinic: { ar: 'سقوط بسيط في بداية الحمل دون ألم أو نزيف: يُبلَّغ الطبيب.', en: 'A minor fall in early pregnancy with no pain or bleeding: tell your doctor.' },
    er: { ar: 'بعد الأسبوع 20: أي سقوط على البطن أو حادث سيارة يستلزم التقييم ومراقبة الجنين حتى مع الشعور بالتحسن.', en: 'After week 20: any fall on the belly or car accident needs assessment and fetal monitoring, even if you feel fine.' } },

  { id: 'lochia', g: 'post', k: 'bleeding lochia postpartum نزيف نفاس دم جلطات',
    t: { ar: 'نزيف النفاس', en: 'Bleeding after birth' },
    home: { ar: 'نزيف يخف تدريجيًا ويتغير لونه من الأحمر إلى البني ثم الأصفر الفاتح خلال نحو 6 أسابيع.', en: 'Bleeding that lightens and changes from red to brown to pale yellow over about 6 weeks.' },
    clinic: { ar: 'رائحة كريهة، أو عودة النزيف الأحمر بعد أن خف.', en: 'Foul smell, or bright red bleeding returning after it had lightened.' },
    er: { ar: 'امتلاء فوطة كاملة خلال ساعة أو أقل، أو جلطات أكبر من حجم البيضة، أو دوار وخفقان.', en: 'Soaking a pad in an hour or less, clots bigger than an egg, or dizziness and racing heart.' } },
  { id: 'wound', g: 'post', k: 'wound cesarean caesarean stitches جرح قيصرية غرز خياطة',
    t: { ar: 'جرح القيصرية أو الغرز', en: 'Caesarean wound or stitches' },
    home: { ar: 'الحفاظ على النظافة والجفاف، وارتداء ملابس واسعة، واستخدام المسكن بالجرعة الموصوفة.', en: 'Keep clean and dry, loose clothes, and pain relief at the labelled dose.' },
    clinic: { ar: 'احمرار حول الجرح، أو إفرازات، أو ألم يزداد بدلًا من أن يخف.', en: 'Redness, discharge, or pain getting worse instead of better.' },
    er: { ar: 'انفتاح الجرح، أو صديد مع حرارة 38 درجة فأعلى.', en: 'The wound opening, or pus with a temperature of 38 °C or more.' } },
  { id: 'breast', g: 'post', k: 'breast engorgement mastitis ثدي احتقان التهاب رضاعة تشقق',
    t: { ar: 'احتقان الثدي والتهابه', en: 'Breast engorgement and mastitis' },
    home: { ar: 'الإرضاع المتكرر كل ساعتين إلى ثلاث ساعات، وكمادات دافئة قبل الرضعة وباردة بعدها، وتغيير وضعية الرضاعة.', en: 'Feed every 2–3 hours, warm compress before and cold after feeds, and vary the feeding position.' },
    clinic: { ar: 'منطقة حمراء مؤلمة مع حرارة أو أعراض تشبه الإنفلونزا، أو تشققات نازفة في الحلمة.', en: 'A red, painful area with fever or flu-like symptoms, or bleeding cracked nipples.' },
    er: { ar: 'حرارة مرتفعة مع إعياء شديد، أو احمرار ينتشر بسرعة.', en: 'High fever with severe illness, or redness spreading fast.' } },
  { id: 'mood', g: 'post', k: 'mood depression sad anxiety baby blues حزن اكتئاب قلق بكاء مزاج',
    t: { ar: 'المزاج والحزن بعد الولادة', en: 'Mood after birth' },
    home: { ar: 'كآبة النفاس (بكاء وتقلب في المزاج خلال أول أسبوعين) شائعة: يُنصح بالنوم الكافي، وانتظام الوجبات، والتحدث مع شخص موثوق.', en: 'Baby blues (tearfulness and mood swings in the first 2 weeks) are common: sleep, regular meals, and talk to someone you trust.' },
    clinic: { ar: 'حزن أو قلق يستمر أكثر من أسبوعين، أو نتيجة 10 فأكثر في مقياس إدنبرة.', en: 'Sadness or anxiety lasting more than 2 weeks, or an Edinburgh score of 10 or more.' },
    er: { ar: 'أفكار بإيذاء النفس أو المولود، أو سماع أو رؤية أشياء غير موجودة، أو ارتباك شديد: يجب الاتصال بالرقم 997 أو 911 فورًا.', en: 'Thoughts of harming yourself or the baby, hearing or seeing things others don’t, or severe confusion: call 997 or 911 now.' } },
  { id: 'clot', g: 'post', k: 'leg pain chest breath clot dvt ساق صدر نفس جلطة',
    t: { ar: 'ألم الساق أو ضيق التنفس', en: 'Leg pain or breathlessness' },
    home: null, clinic: null,
    er: { ar: 'ألم وتورم في ساق واحدة، أو ضيق مفاجئ في التنفس، أو ألم في الصدر، أو سعال مصحوب بدم. هذه من علامات الجلطة.', en: 'Pain and swelling in one leg, sudden breathlessness, chest pain, or coughing blood. These are signs of a clot.' } },
  { id: 'pphtn', g: 'post', k: 'blood pressure headache postpartum ضغط صداع بعد الولادة',
    t: { ar: 'الصداع والضغط بعد الولادة', en: 'Headache and blood pressure after birth' },
    home: { ar: 'الراحة وشرب السوائل، وقياس ضغط الدم إن توفر جهاز منزلي.', en: 'Rest and fluids, and check your blood pressure if you have a monitor.' },
    clinic: { ar: 'ضغط دم 140/90 فأعلى: يجب التواصل مع الطبيب في اليوم نفسه، إذ قد يظهر تسمم الحمل حتى 6 أسابيع بعد الولادة.', en: 'BP 140/90 or higher: contact your doctor the same day. Pre-eclampsia can appear up to 6 weeks after birth.' },
    er: { ar: 'ضغط دم 160/110 فأعلى، أو صداع شديد مع تشوش في الرؤية، أو تشنجات.', en: 'BP 160/110 or higher, severe headache with blurred vision, or seizures.' } },
  { id: 'bladder', g: 'post', k: 'urine leak incontinence bladder بول تسريب مثانة',
    t: { ar: 'البول والمثانة', en: 'Bladder and urine' },
    home: { ar: 'ممارسة تمارين قاع الحوض (كيجل) وتفريغ المثانة بانتظام.', en: 'Pelvic floor (Kegel) exercises and emptying your bladder regularly.' },
    clinic: { ar: 'استمرار تسرب البول بعد 6 أسابيع، أو الشعور بحرقان.', en: 'Ongoing leaking after 6 weeks, or burning.' },
    er: { ar: 'عدم القدرة على التبول مطلقًا مع ألم في البطن.', en: 'Unable to pass urine at all, with abdominal pain.' } },

  { id: 'jaundice', g: 'baby', k: 'jaundice yellow صفار يرقان اصفرار',
    t: { ar: 'اليرقان (الصفار)', en: 'Jaundice (yellow skin)' },
    home: { ar: 'الإرضاع المتكرر من 8 إلى 12 مرة يوميًا، ومراقبة لون الجلد وبياض العين في ضوء النهار.', en: 'Feed 8–12 times a day and check skin and the whites of the eyes in daylight.' },
    clinic: { ar: 'اصفرار يمتد إلى البطن والساقين، أو يستمر بعد أسبوعين، أو يصاحبه براز فاتح أو بول داكن.', en: 'Yellow spreading to belly and legs, lasting beyond 2 weeks, or with pale stools or dark urine.' },
    er: { ar: 'اصفرار في أول 24 ساعة، أو مع خمول وصعوبة في الإيقاظ ورفض للرضاعة.', en: 'Yellow in the first 24 hours, or with sleepiness, hard to wake and refusing feeds.' } },
  { id: 'fever', g: 'baby', k: 'fever temperature حرارة سخونة',
    t: { ar: 'حرارة المولود', en: 'Fever in a newborn' },
    home: { ar: 'عند الشعور بسخونة المولود تُقاس حرارته، ولا يُعطى خافض حرارة لمن هم دون 3 أشهر إلا باستشارة الطبيب.', en: 'If baby feels hot, take the temperature. No fever medicine under 3 months without advice.' },
    clinic: null,
    er: { ar: 'حرارة 38 درجة فأعلى لمن هم دون 3 أشهر: التوجه للطوارئ فورًا حتى لو بدا المولود بخير. وكذلك حرارة أقل من 36.5 درجة مع خمول.', en: 'Temperature 38 °C or higher under 3 months: emergency now, even if baby seems well. Also below 36.5 °C with sleepiness.' } },
  { id: 'feeding', g: 'baby', k: 'feeding diapers wet dehydration رضاعة حفاض جفاف بلل',
    t: { ar: 'الرضاعة والحفاضات', en: 'Feeding and nappies' },
    home: { ar: 'من 8 إلى 12 رضعة يوميًا، مع عدّ الحفاضات حسب العمر من صفحة المولود.', en: '8–12 feeds a day; count nappies by age on the newborn page.' },
    clinic: { ar: 'عدد حفاضات أقل من المتوقع لعمره، أو نقص في الوزن يتجاوز 10%.', en: 'Fewer nappies than expected for age, or weight loss over 10%.' },
    er: { ar: 'عدم وجود حفاض مبلل لأكثر من 8 ساعات مع خمول، أو يافوخ غائر، أو جفاف الفم.', en: 'No wet nappy for over 8 hours with sleepiness, a sunken soft spot, or a dry mouth.' } },
  { id: 'crying', g: 'baby', k: 'crying colic بكاء مغص',
    t: { ar: 'البكاء والمغص', en: 'Crying and colic' },
    home: { ar: 'لف المولود، والهز الخفيف، والصوت الهادئ، والتجشئة بعد الرضعة. ولا يُهز المولود بعنف أبدًا: عند الإرهاق يوضع بأمان في سريره وتؤخذ دقائق للراحة.', en: 'Swaddle, gentle rocking, soft sounds and burping after feeds. Never shake a baby: if overwhelmed, lay baby safely in the cot and take a few minutes.' },
    clinic: { ar: 'بكاء مستمر لساعات يوميًا، أو ضعف في زيادة الوزن.', en: 'Hours of crying every day, or poor weight gain.' },
    er: { ar: 'بكاء حاد غير معتاد مع حرارة أو قيء، أو بطن منتفخ ومتصلب، أو خمول.', en: 'High-pitched, unusual crying with fever or vomiting, a swollen hard belly, or floppiness.' } },
  { id: 'cord', g: 'baby', k: 'cord umbilical navel سرة حبل',
    t: { ar: 'السرة', en: 'Umbilical cord' },
    home: { ar: 'الحفاظ على النظافة والجفاف، وطي الحفاض أسفل السرة. تسقط عادة خلال أسبوع إلى ثلاثة أسابيع.', en: 'Keep clean and dry with the nappy folded below it. It usually falls off in 1–3 weeks.' },
    clinic: { ar: 'إفرازات أو رائحة، أو عدم سقوطها بعد 3 أسابيع.', en: 'Discharge or smell, or still attached after 3 weeks.' },
    er: { ar: 'احمرار ينتشر حول السرة مع حرارة أو خمول.', en: 'Redness spreading around the navel with fever or sleepiness.' } },
  { id: 'vomit', g: 'baby', k: 'vomiting spit up ترجيع استفراغ قيء',
    t: { ar: 'الترجيع', en: 'Spitting up and vomiting' },
    home: { ar: 'الترجيع البسيط بعد الرضعة طبيعي: يُنصح بالتجشئة ورفع رأس المولود بعد الرضعة.', en: 'Small spit-ups after feeds are normal: burp and keep baby upright after feeding.' },
    clinic: { ar: 'ترجيع متكرر مع ضعف في زيادة الوزن.', en: 'Frequent vomiting with poor weight gain.' },
    er: { ar: 'ترجيع قوي مندفع ومتكرر، أو أخضر اللون، أو مصحوب بدم.', en: 'Forceful repeated vomiting, green vomit, or blood.' } },
  { id: 'breathing', g: 'baby', k: 'breathing blue apnea seizure تنفس زرقة تشنج',
    t: { ar: 'التنفس ولون الجلد', en: 'Breathing and colour' },
    home: null, clinic: null,
    er: { ar: 'صعوبة في التنفس، أو ازرقاق الشفتين أو الوجه، أو توقف التنفس 20 ثانية فأكثر، أو تشنجات: يجب الاتصال بالرقم 997 فورًا.', en: 'Struggling to breathe, blue lips or face, pauses in breathing of 20 seconds or more, or seizures: call 997 now.' } }
];

/* Edinburgh Postnatal Depression Scale (Cox, Holden & Sagovsky, 1987). Arabic wording here is for demonstration; clinical use needs the validated Arabic version. Each option: [ar, en, score]. */
MJ.EPDS = [
  { q: { ar: 'استطعتُ أن أضحك وأرى الجانب المضحك من الأمور', en: 'I have been able to laugh and see the funny side of things' },
    o: [['كما كنت دائمًا', 'As much as I always could', 0], ['أقل قليلًا من السابق', 'Not quite so much now', 1], ['أقل بكثير من السابق', 'Definitely not so much now', 2], ['لم أستطع إطلاقًا', 'Not at all', 3]] },
  { q: { ar: 'تطلّعتُ إلى الأشياء بحماس واستمتاع', en: 'I have looked forward with enjoyment to things' },
    o: [['كما كنت دائمًا', 'As much as I ever did', 0], ['أقل من السابق', 'Rather less than I used to', 1], ['أقل بكثير من السابق', 'Definitely less than I used to', 2], ['نادرًا جدًا', 'Hardly at all', 3]] },
  { q: { ar: 'لُمتُ نفسي دون داعٍ عندما سارت الأمور على نحو خاطئ', en: 'I have blamed myself unnecessarily when things went wrong' },
    o: [['نعم، معظم الوقت', 'Yes, most of the time', 3], ['نعم، بعض الوقت', 'Yes, some of the time', 2], ['ليس كثيرًا', 'Not very often', 1], ['لا، أبدًا', 'No, never', 0]] },
  { q: { ar: 'شعرتُ بالقلق أو التوتر دون سبب وجيه', en: 'I have been anxious or worried for no good reason' },
    o: [['لا، إطلاقًا', 'No, not at all', 0], ['نادرًا', 'Hardly ever', 1], ['نعم، أحيانًا', 'Yes, sometimes', 2], ['نعم، كثيرًا جدًا', 'Yes, very often', 3]] },
  { q: { ar: 'شعرتُ بالخوف أو الهلع دون سبب وجيه', en: 'I have felt scared or panicky for no very good reason' },
    o: [['نعم، كثيرًا', 'Yes, quite a lot', 3], ['نعم، أحيانًا', 'Yes, sometimes', 2], ['لا، ليس كثيرًا', 'No, not much', 1], ['لا، إطلاقًا', 'No, not at all', 0]] },
  { q: { ar: 'تراكمت عليّ الأمور', en: 'Things have been getting on top of me' },
    o: [['نعم، معظم الوقت لم أستطع التعامل معها', 'Yes, most of the time I haven\u2019t been able to cope at all', 3], ['نعم، أحيانًا لم أتعامل معها كعادتي', 'Yes, sometimes I haven\u2019t been coping as well as usual', 2], ['لا، تعاملتُ معها جيدًا معظم الوقت', 'No, most of the time I have coped quite well', 1], ['لا، أتعامل معها كما كنت دائمًا', 'No, I have been coping as well as ever', 0]] },
  { q: { ar: 'شعرتُ بالتعاسة إلى حد صعوبة النوم', en: 'I have been so unhappy that I have had difficulty sleeping' },
    o: [['نعم، معظم الوقت', 'Yes, most of the time', 3], ['نعم، أحيانًا', 'Yes, sometimes', 2], ['ليس كثيرًا', 'Not very often', 1], ['لا، إطلاقًا', 'No, not at all', 0]] },
  { q: { ar: 'شعرتُ بالحزن أو التعاسة', en: 'I have felt sad or miserable' },
    o: [['نعم، معظم الوقت', 'Yes, most of the time', 3], ['نعم، كثيرًا', 'Yes, quite often', 2], ['ليس كثيرًا', 'Not very often', 1], ['لا، إطلاقًا', 'No, not at all', 0]] },
  { q: { ar: 'شعرتُ بالتعاسة إلى حد البكاء', en: 'I have been so unhappy that I have been crying' },
    o: [['نعم، معظم الوقت', 'Yes, most of the time', 3], ['نعم، كثيرًا', 'Yes, quite often', 2], ['في أحيان قليلة', 'Only occasionally', 1], ['لا، أبدًا', 'No, never', 0]] },
  { q: { ar: 'راودتني فكرة إيذاء نفسي', en: 'The thought of harming myself has occurred to me' },
    o: [['نعم، كثيرًا', 'Yes, quite often', 3], ['أحيانًا', 'Sometimes', 2], ['نادرًا', 'Hardly ever', 1], ['أبدًا', 'Never', 0]] }
];

MJ.APGAR = [
  { k: 'a', t: { ar: 'اللون (Appearance)', en: 'Appearance (colour)' }, o: [{ ar: 'أزرق أو شاحب بالكامل', en: 'Blue or pale all over' }, { ar: 'الجسم وردي والأطراف زرقاء', en: 'Pink body, blue hands and feet' }, { ar: 'وردي بالكامل', en: 'Pink all over' }] },
  { k: 'p', t: { ar: 'النبض (Pulse)', en: 'Pulse (heart rate)' }, o: [{ ar: 'غياب النبض', en: 'Absent' }, { ar: 'أقل من 100', en: 'Below 100' }, { ar: '100 أو أكثر', en: '100 or more' }] },
  { k: 'g', t: { ar: 'الاستجابة (Grimace)', en: 'Grimace (reflex response)' }, o: [{ ar: 'لا توجد استجابة', en: 'No response' }, { ar: 'تقطيب الوجه', en: 'Grimace' }, { ar: 'بكاء أو عطاس أو سعال', en: 'Cry, sneeze or cough' }] },
  { k: 'act', t: { ar: 'توتر العضلات (Activity)', en: 'Activity (muscle tone)' }, o: [{ ar: 'ارتخاء', en: 'Limp' }, { ar: 'ثني بسيط للأطراف', en: 'Some flexion' }, { ar: 'حركة نشطة', en: 'Active movement' }] },
  { k: 'r', t: { ar: 'التنفس (Respiration)', en: 'Respiration' }, o: [{ ar: 'غياب التنفس', en: 'Absent' }, { ar: 'ضعيف أو غير منتظم', en: 'Weak or irregular' }, { ar: 'قوي مع بكاء', en: 'Strong, crying' }] }
];

/* Caffeine per serving (mg, approximate). */
MJ.CAFFEINE = [
  { id: 'saudi', t: { ar: 'فنجان قهوة سعودية (نحو 30 مل)', en: 'Saudi coffee, one finjan (~30 ml)' }, mg: 15 },
  { id: 'brewed', t: { ar: 'كوب قهوة مقطّرة (240 مل)', en: 'Brewed coffee, mug (240 ml)' }, mg: 95 },
  { id: 'espresso', t: { ar: 'شوت إسبريسو أو لاتيه/كابتشينو بشوت واحد', en: 'Espresso shot, or a one-shot latte/cappuccino' }, mg: 63 },
  { id: 'instant', t: { ar: 'كوب قهوة سريعة التحضير', en: 'Instant coffee, cup' }, mg: 60 },
  { id: 'turkish', t: { ar: 'فنجان قهوة تركية', en: 'Turkish coffee, cup' }, mg: 65 },
  { id: 'tea', t: { ar: 'كوب شاي أحمر (240 مل)', en: 'Black tea, cup (240 ml)' }, mg: 47 },
  { id: 'green', t: { ar: 'كوب شاي أخضر', en: 'Green tea, cup' }, mg: 28 },
  { id: 'cola', t: { ar: 'علبة مشروب غازي كولا (330 مل)', en: 'Cola, can (330 ml)' }, mg: 34 },
  { id: 'energy', t: { ar: 'مشروب طاقة (250 مل)', en: 'Energy drink (250 ml)' }, mg: 80 },
  { id: 'choc', t: { ar: 'شوكولاتة داكنة (30 غرام)', en: 'Dark chocolate (30 g)' }, mg: 22 }
];

/* Dietary Reference Intakes (IOM/National Academies) for women 19–50. */
MJ.DRI = {
  stages: [
    { id: 'non', t: { ar: 'قبل الحمل', en: 'Before pregnancy' } },
    { id: 't1', t: { ar: 'الثلث الأول', en: '1st trimester' } },
    { id: 't2', t: { ar: 'الثلث الثاني', en: '2nd trimester' } },
    { id: 't3', t: { ar: 'الثلث الثالث', en: '3rd trimester' } },
    { id: 'lac', t: { ar: 'الرضاعة (أول 6 أشهر)', en: 'Breastfeeding (0–6 months)' } }
  ],
  rows: [
    { t: { ar: 'سعرات إضافية', en: 'Extra calories' }, u: { ar: 'سعرة/يوم', en: 'kcal/day' }, v: { non: 0, t1: 0, t2: 340, t3: 452, lac: 330 }, plus: true },
    { t: { ar: 'البروتين', en: 'Protein' }, u: { ar: 'غرام', en: 'g' }, v: { non: 46, t1: 71, t2: 71, t3: 71, lac: 71 } },
    { t: { ar: 'الحديد', en: 'Iron' }, u: { ar: 'ملغ', en: 'mg' }, v: { non: 18, t1: 27, t2: 27, t3: 27, lac: 9 } },
    { t: { ar: 'الفولات', en: 'Folate' }, u: { ar: 'ميكروغرام', en: 'mcg DFE' }, v: { non: 400, t1: 600, t2: 600, t3: 600, lac: 500 } },
    { t: { ar: 'الكالسيوم', en: 'Calcium' }, u: { ar: 'ملغ', en: 'mg' }, v: { non: 1000, t1: 1000, t2: 1000, t3: 1000, lac: 1000 } },
    { t: { ar: 'فيتامين د', en: 'Vitamin D' }, u: { ar: 'وحدة دولية', en: 'IU' }, v: { non: 600, t1: 600, t2: 600, t3: 600, lac: 600 } },
    { t: { ar: 'اليود', en: 'Iodine' }, u: { ar: 'ميكروغرام', en: 'mcg' }, v: { non: 150, t1: 220, t2: 220, t3: 220, lac: 290 } },
    { t: { ar: 'الكولين', en: 'Choline' }, u: { ar: 'ملغ', en: 'mg' }, v: { non: 425, t1: 450, t2: 450, t3: 450, lac: 550 } },
    { t: { ar: 'الماء الكلي (من الأكل والشرب)', en: 'Total water (food and drinks)' }, u: { ar: 'لتر', en: 'L' }, v: { non: 2.7, t1: 3.0, t2: 3.0, t3: 3.0, lac: 3.8 } }
  ]
};

MJ.FOODS = {
  avoid: [
    { ar: 'الحليب والأجبان غير المبسترة، والأجبان الطرية ما لم تكن مبسترة', en: 'Unpasteurised milk and cheese; soft cheeses unless pasteurised' },
    { ar: 'اللحوم والدواجن والبيض النيئة أو غير المطهوة جيدًا', en: 'Raw or undercooked meat, poultry and eggs' },
    { ar: 'الأسماك النيئة (السوشي) والأسماك عالية الزئبق: القرش وأبو سيف والماكريل الملكي', en: 'Raw fish (sushi) and high-mercury fish: shark, swordfish, king mackerel' },
    { ar: 'الكبدة ومنتجاتها بكميات كبيرة لاحتوائها على نسبة عالية من فيتامين أ', en: 'Liver and liver products in large amounts (very high vitamin A)' },
    { ar: 'اللحوم الباردة المصنّعة ما لم تُسخَّن حتى يتصاعد منها البخار', en: 'Deli meats unless reheated until steaming hot' },
    { ar: 'الأعشاب والمكملات دون استشارة الطبيب', en: 'Herbal remedies and supplements without advice' },
    { ar: 'الخضار والفواكه غير المغسولة جيدًا، وتنظيف فضلات القطط (داء المقوسات)', en: 'Unwashed fruit and vegetables, and cleaning cat litter (toxoplasmosis)' }
  ],
  sources: [
    { n: { ar: 'الحديد', en: 'Iron' }, f: { ar: 'اللحم الأحمر والدجاج والعدس والحمص والسبانخ والحبوب المدعمة. تناوليها مع مصدر لفيتامين ج كالبرتقال والطماطم والفلفل، وأجّلي الشاي والقهوة ساعة إلى ساعتين بعد الوجبة.', en: 'Red meat, chicken, lentils, chickpeas, spinach, fortified cereals. Pair with vitamin C (orange, tomato, pepper) and leave tea or coffee 1–2 hours after meals.' } },
    { n: { ar: 'الكالسيوم', en: 'Calcium' }, f: { ar: 'الحليب واللبن والزبادي والجبن المبستر والسردين والطحينة.', en: 'Milk, laban, yoghurt, pasteurised cheese, sardines, tahini.' } },
    { n: { ar: 'الفولات', en: 'Folate' }, f: { ar: 'الخضار الورقية والبقوليات والبرتقال والخبز المدعم.', en: 'Leafy greens, legumes, oranges, fortified bread.' } },
    { n: { ar: 'فيتامين د', en: 'Vitamin D' }, f: { ar: 'التعرض لأشعة الشمس والحليب المدعم والبيض والسلمون، وتحتاج كثير من النساء إلى مكمل وفق نتيجة التحليل.', en: 'Sunlight, fortified milk, eggs, salmon. Many women need a supplement based on blood levels.' } },
    { n: { ar: 'أوميغا 3', en: 'Omega-3' }, f: { ar: 'السلمون والسردين (أسماك قليلة الزئبق) مرتين إلى ثلاث مرات أسبوعيًا.', en: 'Salmon and sardines (low mercury) 2–3 times a week.' } },
    { n: { ar: 'الألياف', en: 'Fibre' }, f: { ar: 'الحبوب الكاملة والخضار والفواكه والتمر.', en: 'Whole grains, vegetables, fruit and dates.' } }
  ],
  ramadan: {
    before: { ar: ['استشيري طبيبتك قبل رمضان، فقرار الصيام يختلف من امرأة إلى أخرى.', 'للحامل والمرضع رخصة الإفطار إذا خافت على نفسها أو على طفلها.', 'لا يُنصح بالصيام غالبًا في حالات: سكر الحمل أو السكري المعالج بالأدوية، وارتفاع الضغط أو تسمم الحمل، وفقر الدم، والولادة المبكرة سابقًا، والحمل بتوأم، والقيء الشديد.'],
              en: ['Talk to your doctor before Ramadan; the decision to fast is individual.', 'Pregnant and breastfeeding women have a religious exemption from fasting if they fear for themselves or the baby.', 'Fasting is usually not advised with gestational or other diabetes on treatment, high blood pressure or pre-eclampsia, anaemia, previous preterm birth, twins, or severe vomiting.'] },
    during: { ar: ['أخّري السحور، واحرصي على أن يحتوي على البروتين والنشويات المعقدة.', 'اشربي من لترين إلى ثلاثة لترات من الماء بين الإفطار والسحور.', 'قللي الأطعمة المالحة والمقلية والكافيين.', 'احصلي على قسط من الراحة وقت الظهيرة وتجنبي الحر.'],
              en: ['Have suhoor late, with protein and complex carbohydrates.', 'Drink 2–3 litres of water between iftar and suhoor.', 'Limit salty and fried foods and caffeine.', 'Rest at midday and avoid the heat.'] },
    stop: { ar: ['الدوار أو الإغماء', 'قلة حركة الجنين', 'العطش الشديد أو قلة البول ودكانة لونه', 'الصداع أو تشوش الرؤية', 'الانقباضات أو ألم البطن', 'الخفقان', 'انخفاض السكر عن 70 ملغ/دل عند قياسه'],
            en: ['Dizziness or fainting', 'Fewer baby movements', 'Severe thirst or little dark urine', 'Headache or blurred vision', 'Contractions or abdominal pain', 'Palpitations', 'Glucose below 70 mg/dL if you monitor'] }
  },
  activity: { ar: ['150 دقيقة من النشاط المعتدل أسبوعيًا في الحمل غير المصحوب بمضاعفات، مثل المشي 30 دقيقة خمسة أيام في الأسبوع.', 'تجنبي الرياضات العنيفة أو التي تتضمن احتكاكًا أو خطر السقوط.', 'توقفي عن التمرين عند حدوث نزيف أو دوار أو ألم في الصدر أو انقباضات أو نزول ماء أو ألم وتورم في الساق.', 'من الأسبوع 28 نامي على أحد جانبيكِ.'],
              en: ['150 minutes of moderate activity a week, such as a 30-minute walk five days, for an uncomplicated pregnancy.', 'Avoid contact sports and activities with a risk of falling.', 'Stop exercising with bleeding, dizziness, chest pain, contractions, leaking fluid, or calf pain and swelling.', 'From week 28, go to sleep on your side.'] },
  lactation: { ar: ['تحتاجين إلى نحو 330 سعرة حرارية إضافية يوميًا خلال الأشهر الستة الأولى من الرضاعة الطبيعية.', 'اشربي بحسب شعوركِ بالعطش، واحرصي على وجود الماء بجانبكِ في كل رضعة.', 'استمري في تناول فيتامينات الحمل أو ما يصفه طبيبكِ، خاصة اليود وفيتامين د.', 'تناولي الكافيين باعتدال، ولاحظي إن أصبح المولود متهيجًا.', 'إذا كنتِ مصابة بفقر الدم بعد الولادة فاستمري على الحديد وفق توجيه الطبيب.'],
               en: ['You need about 330 extra calories a day in the first 6 months of breastfeeding.', 'Drink to thirst and keep water nearby at each feed.', 'Continue prenatal vitamins or as prescribed, especially iodine and vitamin D.', 'Caffeine in moderation; watch for a fussy baby.', 'If you were anaemic after birth, continue iron as your doctor advises.'] }
};

MJ.POSTBIRTH = [
  { ar: 'ألم صدر أو ضيق نفس', en: 'Chest pain or trouble breathing' },
  { ar: 'تشنجات', en: 'Seizures' },
  { ar: 'أفكار بإيذاء نفسك أو المولود', en: 'Thoughts of hurting yourself or your baby' },
  { ar: 'نزيف يملأ فوطة خلال ساعة أو جلطات بحجم بيضة أو أكبر', en: 'Bleeding soaking a pad in an hour, or clots the size of an egg or bigger' },
  { ar: 'جرح ما يلتئم أو فيه صديد', en: 'A wound that is not healing or has pus' },
  { ar: 'ساق حمراء متورمة ومؤلمة', en: 'A red, swollen, painful leg' },
  { ar: 'حرارة 38 أو أعلى', en: 'Temperature of 38 °C or higher' },
  { ar: 'صداع شديد ما يروح بالمسكن أو مع زغللة', en: 'Severe headache that pain relief doesn’t help, or with vision changes' }
];

MJ.SOURCES = [
  { t: 'WHO recommendations on antenatal care for a positive pregnancy experience (2016)', u: 'https://www.who.int/publications/i/item/9789241549912' },
  { t: 'Institute of Medicine. Weight Gain During Pregnancy: Reexamining the Guidelines (2009)', u: 'https://www.nationalacademies.org/read/12584/chapter/2' },
  { t: 'ACOG Committee Opinion No. 736: Optimizing Postpartum Care (2018)', u: 'https://www.acog.org/-/media/project/acog/acogorg/clinical/files/committee-opinion/articles/2018/05/optimizing-postpartum-care.pdf' },
  { t: 'IADPSG. Recommendations on the diagnosis and classification of hyperglycemia in pregnancy. Diabetes Care 2010', u: 'https://doi.org/10.2337/dc09-1848' },
  { t: 'CDC MMWR: anaemia in pregnancy cut-offs (Hb <11.0 g/dL in 1st and 3rd, <10.5 g/dL in 2nd trimester)', u: 'https://www.cdc.gov/mmwr/volumes/71/wr/mm7125a1.htm' },
  { t: 'Alexander EK et al. 2017 ATA Guidelines for Thyroid Disease During Pregnancy and Postpartum. Thyroid 2017', u: 'https://doi.org/10.1089/thy.2016.0457' },
  { t: 'Cox JL, Holden JM, Sagovsky R. Edinburgh Postnatal Depression Scale. Br J Psychiatry 1987', u: 'https://doi.org/10.1192/bjp.150.6.782' },
  { t: 'وزارة الصحة السعودية: البرنامج الوطني لفحص حديثي الولادة', u: 'https://www.moh.gov.sa/en/awarenessplateform/ChildsHealth/Pages/NewbornBabies.aspx' },
  { t: 'وزارة الصحة السعودية: جدول التطعيمات الوطني', u: 'https://www.moh.gov.sa/en/HealthAwareness/EducationalContent/HealthTips/Documents/Immunization-Schedule.pdf' },
  { t: 'المركز الوطني لتعزيز الصحة النفسية', u: 'https://ncmh.org.sa' },
  { t: 'Saudi coffee caffeine content (≈50 mg/100 ml), FoodNavigator 2024', u: 'https://www.foodnavigator.com/Article/2024/10/16/saudi-coffee-trends-local-products-faring-well-caffeine-intake-levels-within-recommended-limit-despite-rising-popularity/' }
];
