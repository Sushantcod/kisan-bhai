// Offline Agricultural Expert System Knowledge Base and Fallback Decision Engine
// Provides verified diagnosis, organic remedies, and chemical dosages without needing any external AI API.

export interface DiseaseKnowledge {
  crop: string;
  condition: string;
  severity: 'Low' | 'Medium' | 'High';
  symptoms: string;
  organicSteps: string;
  chemicalSteps: string;
  prevention: string;
}

export const PLANT_DISEASE_KNOWLEDGE: Record<string, DiseaseKnowledge> = {
  // Apple
  "Apple___Apple_scab": {
    crop: "Apple",
    condition: "Apple Scab (Venturia inaequalis)",
    severity: "Medium",
    symptoms: "Olive-green to black velvety spots on leaves, fruit deformation and scabs.",
    organicSteps: "Prune infected branches in winter. Spray 5% cow urine or neem oil (1500 ppm) @ 3-5 ml/L water. Remove fallen leaves to reduce overwintering spores.",
    chemicalSteps: "Spray Captan 50% WP @ 2.5 g/L or Difenoconazole 25% EC @ 0.5 ml/L water during bud break.",
    prevention: "Prune trees to allow maximum sunlight and airflow. Avoid overhead irrigation."
  },
  "Apple___Black_rot": {
    crop: "Apple",
    condition: "Black Rot (Botryosphaeria obtusa)",
    severity: "High",
    symptoms: "Frog-eye leaf spots with purple margins, sunken branch cankers, rotting blackened mummified fruit.",
    organicSteps: "Cut out dead wood and cankers 15 cm below infected tissue. Spray copper oxychloride 50% WP @ 3 g/L.",
    chemicalSteps: "Apply Mancozeb 75% WP @ 2 g/L or Thiophanate-methyl 70% WP @ 1 g/L.",
    prevention: "Sterilize pruning shears between cuts using 70% alcohol. Destroy mummified fruit."
  },
  "Apple___Cedar_apple_rust": {
    crop: "Apple",
    condition: "Cedar Apple Rust (Gymnosporangium juniperi-virginianae)",
    severity: "Medium",
    symptoms: "Bright yellow-orange spots on leaves with tube-like spore structures on undersides.",
    organicSteps: "Remove nearby wild juniper/cedar bushes within 500m. Spray sulfur dust or wettable sulfur @ 2 g/L.",
    chemicalSteps: "Apply Myclobutanil 10% WP @ 1 g/L or Propiconazole 25% EC @ 1 ml/L.",
    prevention: "Plant resistant apple varieties like Enterprise or Liberty."
  },
  "Apple___healthy": {
    crop: "Apple",
    condition: "Healthy Apple Crop",
    severity: "Low",
    symptoms: "Vibrant dark green leaves, no spots, strong shoot growth.",
    organicSteps: "Maintain balanced organic vermicompost (15-20 kg/tree) and mulching around tree canopy.",
    chemicalSteps: "No chemical fungicide required. Maintain prophylactic neem oil spray.",
    prevention: "Monitor soil moisture regularly and maintain good orchard floor sanitation."
  },

  // Cherry
  "Cherry_(including_sour)___Powdery_mildew": {
    crop: "Cherry",
    condition: "Cherry Powdery Mildew (Podosphaera clandestina)",
    severity: "Medium",
    symptoms: "White powdery fungal coating on leaves and young shoots, leaf curling and stunted growth.",
    organicSteps: "Spray potassium bicarbonate @ 3 g/L or diluted sour buttermilk (1:10 with water).",
    chemicalSteps: "Apply Wettable Sulfur 80% WP @ 2.5 g/L or Hexaconazole 5% EC @ 1 ml/L.",
    prevention: "Avoid excessive nitrogen fertilizers which produce susceptible tender shoots."
  },
  "Cherry_(including_sour)___healthy": {
    crop: "Cherry",
    condition: "Healthy Cherry Crop",
    severity: "Low",
    symptoms: "Glossy green foliage with no fungal residue or leaf curl.",
    organicSteps: "Apply organic bone meal and well-rotted farmyard manure around root zones.",
    chemicalSteps: "No treatment needed.",
    prevention: "Keep tree crowns open to reduce high relative humidity."
  },

  // Corn / Maize
  "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": {
    crop: "Corn (Maize)",
    condition: "Gray Leaf Spot (Cercospora zeae-maydis)",
    severity: "High",
    symptoms: "Narrow rectangular tan to grayish lesions bounded by leaf veins on lower leaves progressing upwards.",
    organicSteps: "Till previous crop residue into soil immediately after harvest. Apply Trichoderma viride @ 5 g/L.",
    chemicalSteps: "Spray Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/L or Pyraclostrobin @ 1 ml/L.",
    prevention: "Practice 2-year crop rotation with non-host legumes (soybean, chickpea)."
  },
  "Corn_(maize)___Common_rust_": {
    crop: "Corn (Maize)",
    condition: "Common Rust (Puccinia sorghi)",
    severity: "Medium",
    symptoms: "Golden-brown to cinnamon-brown powdery pustules on both upper and lower leaf surfaces.",
    organicSteps: "Spray sulfur-based bio-formulation. Ensure proper spacing to lower canopy moisture.",
    chemicalSteps: "Spray Mancozeb 75% WP @ 2.5 g/L or Tebuconazole 25.9% EC @ 1.2 ml/L water.",
    prevention: "Sow resistant hybrid seeds. Avoid delayed late-season planting."
  },
  "Corn_(maize)___Northern_Leaf_Blight": {
    crop: "Corn (Maize)",
    condition: "Northern Leaf Blight (Exserohilum turcicum)",
    severity: "High",
    symptoms: "Large, elongated cigar-shaped grayish-green lesions (2.5 to 15 cm long) on foliage.",
    organicSteps: "Deep summer plowing to bury infected stubbles. Spray Pseudomonas fluorescens @ 5 g/L.",
    chemicalSteps: "Foliar spray with Propiconazole 25% EC (Tilt) @ 1 ml/L or Chlorothalonil 75% WP @ 2 g/L.",
    prevention: "Maintain balanced potash fertilization to strengthen plant cell walls."
  },
  "Corn_(maize)___healthy": {
    crop: "Corn (Maize)",
    condition: "Healthy Corn / Maize Crop",
    severity: "Low",
    symptoms: "Broad, deep-green erect leaves, uniform whorl development, strong root anchorage.",
    organicSteps: "Side-dress with vermicompost and bio-fertilizer Azospirillum at knee-high stage.",
    chemicalSteps: "No chemical required. Maintain balanced NPK 120:60:40 kg/ha ratio.",
    prevention: "Maintain optimal field drainage; avoid water stagnation for more than 24 hours."
  },

  // Grape
  "Grape___Black_rot": {
    crop: "Grape",
    condition: "Grape Black Rot (Guignardia bidwellii)",
    severity: "High",
    symptoms: "Small reddish-brown circular leaf spots with dark margins; berries shrivel into hard black mummies.",
    organicSteps: "Prune mummified grape clusters and burn them. Apply Bordeaux mixture (1%) before bloom.",
    chemicalSteps: "Spray Mancozeb 75% WP @ 2.5 g/L or Kresoxim-methyl 44.3% SC @ 0.7 ml/L.",
    prevention: "Train canopy for maximum horizontal air movement. Keep lower canopy clear of ground."
  },
  "Grape___Esca_(Black_Measles)": {
    crop: "Grape",
    condition: "Esca / Black Measles (Fungal Complex)",
    severity: "High",
    symptoms: "Tiger-stripe yellowing and browning between leaf veins; dark spots on berry skins.",
    organicSteps: "Paint pruning wounds with copper paste. Disinfect pruning shears in 10% bleach.",
    chemicalSteps: "Apply systemic triazole fungicide drench around vine collar: Carbendazim 50% WP @ 2 g/L.",
    prevention: "Avoid heavy winter pruning during wet, rainy spells when spores circulate."
  },
  "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
    crop: "Grape",
    condition: "Grape Leaf Blight (Phaeoisariopsis vitis)",
    severity: "Medium",
    symptoms: "Irregular dull brown to dark reddish spots with olive velvety mold on underside of leaves.",
    organicSteps: "Spray neem oil 1500 ppm @ 4 ml/L with liquid soap emulsifier. Remove diseased leaves.",
    chemicalSteps: "Spray Copper Oxychloride 50% WP @ 2.5 g/L or Ziram 80% WP @ 2 g/L.",
    prevention: "Spray immediately after early monsoon showers."
  },
  "Grape___healthy": {
    crop: "Grape",
    condition: "Healthy Grapevine",
    severity: "Low",
    symptoms: "Vigorous vine shoots, clean green palmate leaves, uniform cluster set.",
    organicSteps: "Apply seaweed extract spray @ 2 ml/L during flowering and fruit development.",
    chemicalSteps: "No chemical fungicide needed.",
    prevention: "Maintain strict canopy management and drip fertigation."
  },

  // Orange / Citrus
  "Orange___Haunglongbing_(Citrus_greening)": {
    crop: "Orange / Citrus",
    condition: "Citrus Greening / Huanglongbing (HLB)",
    severity: "High",
    symptoms: "Asymmetrical blotchy mottle leaf chlorosis, yellow shoots, small lopsided bitter fruits.",
    organicSteps: "Strict control of vector Asian Citrus Psyllid using yellow sticky traps and neem oil 2% spray.",
    chemicalSteps: "Vector control: Spray Imidacloprid 17.8% SL @ 0.5 ml/L or Thiamethoxam 25% WG @ 0.3 g/L.",
    prevention: "Use certified disease-free nursery saplings. Eradicate infected trees promptly to save the grove."
  },

  // Potato
  "Potato___Early_blight": {
    crop: "Potato",
    condition: "Potato Early Blight (Alternaria solani)",
    severity: "Medium",
    symptoms: "Target-like concentric rings on older lower leaves, leaf yellowing and premature defoliation.",
    organicSteps: "Spray cow-urine decoction or Trichoderma harzianum @ 5 g/L. Avoid overhead sprinkler irrigation.",
    chemicalSteps: "Foliar spray with Mancozeb 75% WP @ 2 g/L or Chlorothalonil 75% WP @ 2 g/L every 10-14 days.",
    prevention: "Crop rotation with non-solanaceous crops (maize, mustard, legumes)."
  },
  "Potato___Late_blight": {
    crop: "Potato",
    condition: "Potato Late Blight (Phytophthora infestans)",
    severity: "High",
    symptoms: "Water-soaked dark lesions on leaf tips turning black, white cottony mold under leaves in high humidity.",
    organicSteps: "Spray Bordeaux mixture (1%) or Copper Hydroxide @ 2 g/L at first sign of cloudy damp weather.",
    chemicalSteps: "Apply Cymoxanil 8% + Mancozeb 64% WP @ 2.5 g/L or Metalaxyl 8% + Mancozeb 64% WP @ 2.5 g/L.",
    prevention: "Earthing up properly to protect tubers from spores washing down into soil."
  },
  "Potato___healthy": {
    crop: "Potato",
    condition: "Healthy Potato Crop",
    severity: "Low",
    symptoms: "Dense green lush canopy, firm erect stems, no leaf spotting.",
    organicSteps: "Apply compost, bio-potash, and maintain consistent soil moisture.",
    chemicalSteps: "No chemicals required.",
    prevention: "Monitor regularly for early humidity-driven blight warnings."
  },

  // Tomato
  "Tomato___Bacterial_spot": {
    crop: "Tomato",
    condition: "Tomato Bacterial Spot (Xanthomonas campestris)",
    severity: "High",
    symptoms: "Small, greasy water-soaked circular dark spots on leaves, scabby raised spots on green tomatoes.",
    organicSteps: "Spray copper soap or neem seed kernel extract (NSKE 5%). Avoid working in wet fields.",
    chemicalSteps: "Spray Copper Oxychloride 50% WP @ 2.5 g/L combined with Streptocycline @ 0.5 g / 10 L water.",
    prevention: "Use hot-water treated seeds (50°C for 25 minutes) and clean trellising stakes."
  },
  "Tomato___Early_blight": {
    crop: "Tomato",
    condition: "Tomato Early Blight (Alternaria solani)",
    severity: "Medium",
    symptoms: "Concentric brown-black rings resembling a target board on lower leaves, yellowing margins.",
    organicSteps: "Prune lower leaves touching soil. Spray fermented butter-milk (chaas) mixed with copper vessel water.",
    chemicalSteps: "Spray Mancozeb 75% WP @ 2 g/L or Azoxystrobin 23% SC @ 1 ml/L.",
    prevention: "Stake tomato vines vertically and mulch soil with straw to prevent soil splashing."
  },
  "Tomato___Late_blight": {
    crop: "Tomato",
    condition: "Tomato Late Blight (Phytophthora infestans)",
    severity: "High",
    symptoms: "Large, irregular greasy brown lesions on leaves and stems, white fungal growth under humid mornings.",
    organicSteps: "Apply Copper Oxychloride 50% WP @ 3 g/L immediately at onset of foggy/rainy weather.",
    chemicalSteps: "Spray Dimethomorph 50% WP @ 1 g/L or Metalaxyl-M + Mancozeb (Ridomil Gold) @ 2.5 g/L.",
    prevention: "Ensure excellent soil drainage and avoid planting near potato plots."
  },
  "Tomato___Leaf_Mold": {
    crop: "Tomato",
    condition: "Tomato Leaf Mold (Passalora fulva)",
    severity: "Medium",
    symptoms: "Pale greenish-yellow spots on upper leaf surface with velvety olive-brown mold patches beneath.",
    organicSteps: "Increase greenhouse/polyhouse ventilation. Spray bio-fungicide Bacillus subtilis @ 5 g/L.",
    chemicalSteps: "Apply Difenoconazole 25% EC @ 0.5 ml/L or Chlorothalonil 75% WP @ 2 g/L.",
    prevention: "Keep greenhouse relative humidity below 80%."
  },
  "Tomato___Septoria_leaf_spot": {
    crop: "Tomato",
    condition: "Septoria Leaf Spot (Septoria lycopersici)",
    severity: "Medium",
    symptoms: "Numerous small circular spots with grayish-white centers and dark brown margins with black specks.",
    organicSteps: "Strip off and destroy bottom 2-3 infected leaf branches. Spray neem oil 1500 ppm @ 4 ml/L.",
    chemicalSteps: "Spray Mancozeb 75% WP @ 2 g/L or Zineb 75% WP @ 2 g/L at 7-day intervals.",
    prevention: "Never irrigate with overhead sprinklers; always use drip lines at the base."
  },
  "Tomato___Spider_mites Two-spotted_spider_mite": {
    crop: "Tomato",
    condition: "Two-Spotted Spider Mites (Tetranychus urticae)",
    severity: "Medium",
    symptoms: "Fine white or yellow stippling speckles on leaf tops, fine webbing on leaf undersides, bronzing.",
    organicSteps: "Spray forceful cold water jet under leaves. Apply neem oil 3000 ppm @ 3 ml/L or wettable sulfur.",
    chemicalSteps: "Spray Spiromesifen 22.9% SC (Oberon) @ 1 ml/L or Propargite 57% EC @ 2 ml/L.",
    prevention: "Avoid dry, dusty roadside conditions which promote mite population explosions."
  },
  "Tomato___Target_Spot": {
    crop: "Tomato",
    condition: "Tomato Target Spot (Corynespora cassiicola)",
    severity: "Medium",
    symptoms: "Brown pinpoint lesions with concentric rings, surrounded by yellow halos on mature leaves.",
    organicSteps: "Spray Trichoderma harzianum @ 5 g/L. Remove old plant debris immediately.",
    chemicalSteps: "Spray Pyraclostrobin 20% WG @ 1 g/L or Chlorothalonil 75% WP @ 2 g/L.",
    prevention: "Provide wide row spacing (90 cm x 60 cm) to facilitate quick leaf drying."
  },
  "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
    crop: "Tomato",
    condition: "Tomato Yellow Leaf Curl Virus (TYLCV)",
    severity: "High",
    symptoms: "Upward cupping and curling of leaf margins, severe yellowing, bushy stunted growth with flower drop.",
    organicSteps: "Control whitefly vector: install 25 yellow sticky traps per acre. Spray neem oil (10,000 ppm) @ 2 ml/L.",
    chemicalSteps: "Whitefly management: Spray Diafenthiuron 50% WP @ 1.2 g/L or Acetamiprid 20% SP @ 0.3 g/L.",
    prevention: "Eradicate virus-infected plants immediately to prevent transmission to neighboring rows."
  },
  "Tomato___Tomato_mosaic_virus": {
    crop: "Tomato",
    condition: "Tomato Mosaic Virus (ToMV)",
    severity: "High",
    symptoms: "Mottling with alternating light and dark green areas on leaves, fern-like leaf distortion.",
    organicSteps: "Soak contaminated tools in 20% non-fat dry milk solution. No chemical cures viral diseases.",
    chemicalSteps: "Spray micronutrient mixtures (Zinc + Boron) to assist remaining healthy plants.",
    prevention: "Wash hands with soap before handling crops (especially tobacco users)."
  },
  "Tomato___healthy": {
    crop: "Tomato",
    condition: "Healthy Tomato Crop",
    severity: "Low",
    symptoms: "Deep green leaves, sturdy stems, active yellow blossoming, firm fruit set.",
    organicSteps: "Apply compost tea, vermicompost, and Panchagavya spray (3%) every 15 days.",
    chemicalSteps: "No chemical required. Maintain balanced 19:19:19 water-soluble fertigation.",
    prevention: "Maintain regular pruning of suckers and steady drip irrigation."
  },

  // Wheat (Indian field crop)
  "Wheat___Yellow_Rust": {
    crop: "Wheat",
    condition: "Wheat Stripe / Yellow Rust (Puccinia striiformis)",
    severity: "High",
    symptoms: "Yellow to orange-yellow powdery pustules arranged in linear parallel stripes on leaf blades.",
    organicSteps: "Sow early in November to avoid peak infection window. Spray fermented butter-milk with hing (asafoetida).",
    chemicalSteps: "Spray Propiconazole 25% EC (Tilt) @ 1 ml/L or Tebuconazole 25% EC @ 1 ml/L immediately on first sighting.",
    prevention: "Sow rust-resistant varieties like HD-2967, HD-3086, DBW-187, or PBW-725."
  },
  "Wheat___healthy": {
    crop: "Wheat",
    condition: "Healthy Wheat Crop",
    severity: "Low",
    symptoms: "Vibrant emerald green tillers, clean upright blades, vigorous root system.",
    organicSteps: "Apply bio-fertilizer Azotobacter and PSB seed treatment. Top-dress with well-rotted manure.",
    chemicalSteps: "No fungicide needed. Apply recommended Urea in split doses (1/3 basal, 1/3 first irrigation, 1/3 tillering).",
    prevention: "Irrigate at critical stages: Crown Root Initiation (CRI at 21 days), Tillering, and Booting."
  },

  // Rice / Paddy (Indian field crop)
  "Rice___Blast": {
    crop: "Rice / Paddy",
    condition: "Rice Blast (Magnaporthe oryzae)",
    severity: "High",
    symptoms: "Spindle or eye-shaped lesions with gray/whitish centers and dark brown margins on leaves; neck rot.",
    organicSteps: "Seed treatment with Pseudomonas fluorescens @ 10 g/kg seed. Avoid excess nitrogen fertilizer.",
    chemicalSteps: "Spray Tricyclazole 75% WP @ 0.6 g/L or Isoprothiolane 40% EC @ 1.5 ml/L water.",
    prevention: "Maintain shallow standing water (2-3 cm) during critical periods."
  },
  "Rice___healthy": {
    crop: "Rice / Paddy",
    condition: "Healthy Rice / Paddy Crop",
    severity: "Low",
    symptoms: "Lush upright green tillers, clean sheath, no spotting or leaf tip burn.",
    organicSteps: "Incorporate Azolla bio-fertilizer into paddy water to fix atmospheric nitrogen naturally.",
    chemicalSteps: "No chemical required. Maintain balanced NPK 120:60:40 with Zinc sulfate 25 kg/ha basal.",
    prevention: "Alternate wetting and drying (AWD) water management to save water and strengthen root depth."
  }
};

// General Farming Knowledge Rules
export const GENERAL_AGRI_RULES = [
  {
    keywords: ["npk", "fertilizer", "khad", "urea", "dap", "potash"],
    response: `**Balanced Fertilizer Guidance (NPK):**
- **Basal Dose (Sowing):** Apply full Phosphorus (DAP/SSP) and Potash (MOP) along with 1/3rd of Nitrogen (Urea).
- **Vegetative Stage (First Irrigation):** Top-dress with 1/3rd Urea to promote tillering and shoot growth.
- **Flowering / Booting Stage:** Apply remaining 1/3rd Urea. Avoid excessive Nitrogen as it makes plants soft and prone to fungal blights!
- **Micro-nutrients:** If leaves show yellowing between veins, apply Zinc Sulfate (21%) @ 5 kg/acre or Zinc EDTA spray @ 1 g/L.`
  },
  {
    keywords: ["water", "irrigation", "paani", "watering", "dry"],
    response: `**Smart Irrigation Best Practices:**
- Always irrigate during early morning or late afternoon to minimize evaporation loss.
- **Critical Stages:** 
  - *Wheat:* Crown Root Initiation (Day 21), Tillering, and Grain Filling.
  - *Paddy:* Panicle Initiation and Flowering (never let fields dry completely during flowering).
  - *Tomato / Vegetables:* Consistent drip watering every 2-3 days prevents blossom end rot and fruit cracking.`
  },
  {
    keywords: ["helpline", "call", "phone", "contact", "support", "government", "sarkari"],
    response: `**National Kisan Helpline & Emergency Contacts:**
- 📞 **Kisan Call Center (Toll-Free):** 1800-180-1551 (6:00 AM to 10:00 PM in all Indian languages)
- 🌾 **PM-Kisan Portal Support:** 011-24300606 / 155261
- 🌦️ **Kisan Suvidha Portal:** Access mandi prices, weather forecasts, and certified seed dealers in your district.`
  },
  {
    keywords: ["pest", "insect", "keeda", "caterpillar", "worm", "neem"],
    response: `**Integrated Pest Management (IPM) Protocol:**
- **Organic Neem Spray:** Mix 5 ml Neem Oil (1500 ppm or 3000 ppm) with 1 ml liquid soap per liter of water. Spray thoroughly on leaf undersides.
- **Sticky Traps:** Install 15-20 Yellow sticky traps (for whiteflies/aphids) and Blue sticky traps (for thrips) per acre.
- **Pheromone Traps:** Install 5 traps per acre for early detection of bollworms and stem borers.`
  }
];

export interface ExpertSystemResult {
  source: 'expert_system';
  title: string;
  crop?: string;
  severity?: string;
  content: string;
}

// Format diagnosis into simple, easy-to-understand advice for everyday farmers
export const formatFarmerFriendlyDiagnosis = (
  rawClass: string,
  crop: string,
  disease: string,
  confidence: number,
  lang: string = 'en'
): string => {
  const expert = PLANT_DISEASE_KNOWLEDGE[rawClass];
  const isHealthy = rawClass.toLowerCase().includes('healthy') || disease.toLowerCase().includes('healthy');

  // Common colloquial Indian farming disease names
  const commonNames: Record<string, { hi: string; pa: string; mr: string; en: string }> = {
    'Tomato___Early_blight': {
      hi: 'अगेती झुलसा (Early Blight / टार्गेट स्पॉट)',
      pa: 'ਅਗੇਤੀ ਝੁਲਸਾ ਰੋਗ (Early Blight)',
      mr: 'करपा रोग (Early Blight)',
      en: 'Early Blight (Fungal Leaf Spot)'
    },
    'Tomato___Late_blight': {
      hi: 'पिछेती झुलसा (Late Blight / महाझुलसा)',
      pa: 'ਪਿਛੇਤਾ ਝੁਲਸਾ ਰੋਗ (Late Blight)',
      mr: 'उशिरा येणारा करपा (Late Blight)',
      en: 'Late Blight (Severe Foliar Blight)'
    },
    'Tomato___Bacterial_spot': {
      hi: 'जीवाणु धब्बा रोग (Bacterial Spot)',
      pa: 'ਜੀਵਾਣੂ ਧੱਬਾ ਰੋਗ (Bacterial Spot)',
      mr: 'जिवाणू डाग रोग (Bacterial Spot)',
      en: 'Bacterial Spot Disease'
    },
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus': {
      hi: 'पत्ती मुड़न / मरोड़िया रोग (Kukda / Leaf Curl Virus)',
      pa: 'ਪੱਤਾ ਮਰੋੜ ਰੋਗ (Leaf Curl Virus)',
      mr: 'पान आकसणे / चुरडा-मुरडा (Leaf Curl)',
      en: 'Yellow Leaf Curl Virus (Kukda)'
    },
    'Potato___Early_blight': {
      hi: 'आलू का अगेती झुलसा (Early Blight)',
      pa: 'ਆਲੂ ਦਾ ਅਗੇਤੀ ਝੁਲਸਾ (Early Blight)',
      mr: 'बटाट्यावरील करपा (Early Blight)',
      en: 'Potato Early Blight'
    },
    'Potato___Late_blight': {
      hi: 'आलू का पिछेती झुलसा (Late Blight / पाला मारना)',
      pa: 'ਆਲੂ ਦਾ ਪਿਛੇਤਾ ਝੁਲਸਾ (Late Blight)',
      mr: 'बटाट्यावरील उशिरा येणारा करपा',
      en: 'Potato Late Blight'
    },
    'Apple___Apple_scab': {
      hi: 'सेब का पपड़ी रोग (Apple Scab)',
      pa: 'ਸੇਬ ਦਾ ਸਕੈਬ ਰੋਗ (Apple Scab)',
      mr: 'सफरचंदावरील खरुज रोग (Scab)',
      en: 'Apple Scab Disease'
    },
    'Corn_(maize)___Common_rust_': {
      hi: 'मक्का का रतुआ / गेरुई रोग (Common Rust)',
      pa: 'ਮੱਕੀ ਦਾ ਕੁੰਗੀ ਰੋਗ (Common Rust)',
      mr: 'मक्यावरील तांबेरा रोग (Rust)',
      en: 'Corn Common Rust'
    },
    'Corn_(maize)___Northern_Leaf_Blight': {
      hi: 'मक्का का पत्ता झुलसा (Northern Leaf Blight)',
      pa: 'ਮੱਕੀ ਦਾ ਪੱਤਾ ਝੁਲਸਾ (Leaf Blight)',
      mr: 'मक्यावरील करपा (Leaf Blight)',
      en: 'Corn Northern Leaf Blight'
    },
    'Wheat___Yellow_Rust': {
      hi: 'गेहूं का पीला रतुआ (Yellow Rust / पीली कुंगी)',
      pa: 'ਕਣਕ ਦੀ ਪੀਲੀ ਕੁੰਗੀ (Yellow Rust)',
      mr: 'गव्हावरील पिवळा तांबेरा (Yellow Rust)',
      en: 'Wheat Stripe / Yellow Rust'
    },
    'Rice___Blast': {
      hi: 'धान का झुलसा / ब्लास्ट रोग (Rice Blast)',
      pa: 'ਝੋਨੇ ਦਾ ਬਲਾਸਟ ਰੋਗ (Rice Blast)',
      mr: 'भातावरील करपा / ब्लास्ट रोग',
      en: 'Rice Blast Disease'
    }
  };

  const localizedName = commonNames[rawClass]?.[lang as 'hi'|'pa'|'mr'|'en'] || disease;

  if (isHealthy) {
    if (lang === 'hi') {
      return `🌾 **किसान भाई, फसल जांच रिपोर्ट: ${crop}**\n` +
        `• **स्थिति:** **एकदम स्वस्थ फसल (100% तंदुरुस्त)**\n` +
        `• **जांच सटीकता:** ${confidence}%\n\n` +
        `✅ **फसल की स्थिति:**\n` +
        `पौधे के पत्ते गहरे हरे और बिल्कुल साफ हैं। पत्तों पर कोई फफूंद, धब्बा या कीड़ा नहीं है।\n\n` +
        `🌱 **फसल को ऐसा ही हरा-भरा रखने के उपाय:**\n` +
        `1. **संतुलित खाद:** ज्यादा यूरिया न डालें। 15-20 दिनों में वर्मीकम्पोस्ट या हल्की जैविक खाद दें।\n` +
        `2. **नमी बनाए रखें:** खेत में पानी जमा न होने दें, मिट्टी में हल्की नमी रखें।\n` +
        `3. **सावधानी छिड़काव:** बचाव के लिए हर 15 दिन में 5 ml नीम का तेल प्रति लीटर पानी में मिलाकर छिड़क सकते हैं।\n\n` +
        `📞 *मुफ्त सरकारी कृषि सलाह के लिए कॉल करें: 1800-180-1551 (टोल-फ्री)*`;
    }
    if (lang === 'pa') {
      return `🌾 **ਕਿਸਾਨ ਵੀਰੋ, ਫ਼ਸਲ ਜਾਂਚ ਰਿਪੋਰਟ: ${crop}**\n` +
        `• **ਹਾਲਤ:** **ਬਿਲਕੁਲ ਤੰਦਰੁਸਤ ਫ਼ਸਲ (Healthy Crop)**\n` +
        `• **ਜਾਂਚ:** ${confidence}%\n\n` +
        `✅ **ਫ਼ਸਲ ਦੀ ਹਾਲਤ:**\n` +
        `ਪੱਤੇ ਬਿਲਕੁਲ ਸਾਫ਼ ਅਤੇ ਗੂੜ੍ਹੇ ਹਰੇ ਹਨ। ਕੋਈ ਉੱਲੀ ਜਾਂ ਕੀੜਾ ਨਹੀਂ ਹੈ।\n\n` +
        `🌱 **ਫ਼ਸਲ ਨੂੰ ਤੰਦਰੁਸਤ ਰੱਖਣ ਦੇ ਤਰੀਕੇ:**\n` +
        `1. **ਸੰਤੁਲਿਤ ਖਾਦ:** ਯੂਰੀਆ ਦੀ ਜ਼ਿਆਦਾ ਵਰਤੋਂ ਨਾ ਕਰੋ, ਰੂੜੀ ਜਾਂ ਵਰਮੀਕੰਪੋਸਟ ਪਾਓ।\n` +
        `2. **ਪਾਣੀ ਦਾ ਪ੍ਰਬੰਧ:** ਖੇਤ ਵਿੱਚ ਪਾਣੀ ਖੜ੍ਹਾ ਨਾ ਹੋਣ ਦਿਓ।\n\n` +
        `📞 *ਸਰਕਾਰੀ ਕਿਸਾਨ ਹੈਲਪਲਾਈਨ: 1800-180-1551 (ਟੋਲ-ਫ਼੍ਰੀ)*`;
    }
    if (lang === 'mr') {
      return `🌾 **शेतकरी मित्र, पीक तपासणी अहवाल: ${crop}**\n` +
        `• **स्थिती:** **पूर्णपणे निरोगी पीक (100% सुदृढ)**\n` +
        `• **अचूकता:** ${confidence}%\n\n` +
        `✅ **पिकाची स्थिती:**\n` +
        `झाडाची पाने हिरवीगार व स्वच्छ आहेत. पानांवर कोणताही बुरशीचा किंवा किडीचा प्रादुर्भाव नाही.\n\n` +
        `🌱 **पीक निरोगी ठेवण्यासाठी सोपे उपाय:**\n` +
        `1. संतुलित खतांचा वापर करा, नत्राचा जास्त वापर टाळा.\n` +
        `2. प्रतिबंधक उपाय म्हणून 15 दिवसांतून एकदा निंबोळी अर्क (5 मिली/लिटर) फवारा.\n\n` +
        `📞 *मोफत शेतकरी कॉल सेंटर: 1800-180-1551*`;
    }
    return `🌾 **Kisan Health Report: ${crop}**\n` +
      `• **Status:** **100% Healthy Crop**\n` +
      `• **Model Confidence:** ${confidence}%\n\n` +
      `✅ **Field Observation:**\n` +
      `The leaves are vibrant green and completely free from active fungal lesions, leaf spots, or pest webs.\n\n` +
      `🌱 **Care & Maintenance Tips:**\n` +
      `1. **Balanced Nutrition:** Avoid excessive urea/nitrogen. Apply organic compost to keep roots strong.\n` +
      `2. **Watering:** Maintain consistent soil moisture without water-logging.\n` +
      `3. **Preventive Care:** Spray organic neem oil (5 ml/L water) every 15 days as a natural shield.\n\n` +
      `📞 *Kisan Call Center Toll-Free: 1800-180-1551*`;
  }

  // Infected Leaf Response
  if (lang === 'hi') {
    return `🌾 **किसान भाई, फसल रोग जांच रिपोर्ट**\n` +
      `• **फसल का नाम:** ${crop}\n` +
      `• **पहचानी गई बीमारी:** **${localizedName}**\n` +
      `• **जांच सटीकता:** ${confidence}% (${confidence > 90 ? 'पक्की पहचान' : 'संभावित'})\n` +
      `• **खतरे का स्तर:** ${expert?.severity === 'High' ? '⚠️ गंभीर (तुरंत छिड़काव करें)' : 'मध्यम (2-3 दिनों में रोकें)'}\n\n` +
      `🔍 **खेत में बीमारी के लक्षण:**\n` +
      `${expert?.symptoms || 'पत्तियों पर धब्बे और किनारों का पीला पड़ना।'}\n\n` +
      `🌱 **घर का देसी और जैविक उपाय (तुरंत करें):**\n` +
      `${expert?.organicSteps || 'खराब पत्तियां तोड़कर दूर फेंकें। 1 लीटर पानी में 5 ml नीम का तेल + 1 चम्मच साबुन मिलाकर छिड़कें।'}\n\n` +
      `💊 **दवा का छिड़काव और सही मात्रा (केमिकल उपचार):**\n` +
      `${expert?.chemicalSteps || 'साफ (Saaf) या मैनकोजेब 2 ग्राम प्रति लीटर पानी (15 लीटर टंकी में 30 ग्राम) मिलाकर छिड़कें।'}\n\n` +
      `⚠️ **किसान भाई इन गलतियों से बचें:**\n` +
      `• पत्तियों के ऊपर पानी न डालें; हमेशा **जड़ों में पानी दें**।\n` +
      `• दोपहर की तेज धूप में छिड़काव न करें; शाम 4 से 6 बजे के बीच ही छिड़कें।\n\n` +
      `📞 **मुफ्त सरकारी किसान सलाह:** डायल करें **1800-180-1551** (टोल-फ्री किसान कॉल सेंटर)।`;
  }

  if (lang === 'pa') {
    return `🌾 **ਕਿਸਾਨ ਵੀਰੋ, ਫ਼ਸਲ ਜਾਂਚ ਰਿਪੋਰਟ**\n` +
      `• **ਫ਼ਸਲ:** ${crop}\n` +
      `• **ਬਿਮਾਰੀ:** **${localizedName}**\n` +
      `• **ਜਾਂਚ:** ${confidence}%\n` +
      `• **ਖ਼ਤਰਾ:** ${expert?.severity === 'High' ? '⚠️ ਜ਼ਿਆਦਾ (ਤੁਰੰਤ ਸਪਰੇਅ ਕਰੋ)' : 'ਦਰਮਿਆਨਾ'}\n\n` +
      `🔍 **ਖੇਤ ਵਿੱਚ ਲੱਛਣ:**\n` +
      `${expert?.symptoms || 'ਪੱਤਿਆਂ ਤੇ ਧੱਬੇ ਅਤੇ ਪੀਲਾਪਣ।'}\n\n` +
      `🌱 **ਦੇਸੀ ਅਤੇ ਜੈਵਿਕ ਹੱਲ:**\n` +
      `${expert?.organicSteps || 'ਨਿੰਮ ਦਾ ਤੇਲ 5 ਮਿ.ਲੀ. ਪ੍ਰਤੀ ਲੀਟਰ ਪਾਣੀ ਵਿੱਚ ਮਿਲਾ ਕੇ ਛਿੜਕੋ।'}\n\n` +
      `💊 **ਦਵਾਈ ਅਤੇ ਸਹੀ ਮਾਤਰਾ:**\n` +
      `${expert?.chemicalSteps || 'ਮੈਨਕੋਜ਼ੈਬ 2 ਗ੍ਰਾਮ ਪ੍ਰਤੀ ਲੀਟਰ ਪਾਣੀ (15 ਲੀਟਰ ਢੋਲੀ ਵਿੱਚ 30 ਗ੍ਰਾਮ)।'}\n\n` +
      `⚠️ **ਸਾਵਧਾਨੀ:** ਪੱਤਿਆਂ ਉੱਤੇ ਪਾਣੀ ਨਾ ਸੁੱਟੋ, ਸ਼ਾਮ ਵੇਲੇ ਸਪਰੇਅ ਕਰੋ।\n\n` +
      `📞 **ਟੋਲ-ਫ਼੍ਰੀ ਕਿਸਾਨ ਹੈਲਪਲਾਈਨ:** **1800-180-1551**`;
  }

  if (lang === 'mr') {
    return `🌾 **शेतकरी मित्र, पीक रोग अहवाल**\n` +
      `• **पीक:** ${crop}\n` +
      `• **आढळलेला रोग:** **${localizedName}**\n` +
      `• **अचूकता:** ${confidence}%\n` +
      `• **धोका पातळी:** ${expert?.severity === 'High' ? '⚠️ जास्त (लगेच फवारणी करा)' : 'मध्यम'}\n\n` +
      `🔍 **लक्षणे:**\n` +
      `${expert?.symptoms || 'पानांवर डाग आणि पिवळेपणा.'}\n\n` +
      `🌱 **सेंद्रिय / घरगुती उपाय:**\n` +
      `${expert?.organicSteps || '5 मिली निंबोळी अर्क प्रति लिटर पाण्यात मिसळून फवारा.'}\n\n` +
      `💊 **औषध आणि फवारणीचे प्रमाण:**\n` +
      `${expert?.chemicalSteps || 'मॅनकोझेब किंवा साफ 2 ग्रॅम प्रति लिटर पाणी (15 लिटर पंपात 30 ग्रॅम).'}\n\n` +
      `⚠️ **महत्त्वाची काळजी:** झाडाच्या मुळाशी पाणी द्या, उन्हात फवारणी करू नका.\n\n` +
      `📞 **मोफत शेतकरी हेल्पलाइन:** **1800-180-1551**`;
  }

  // English (Default)
  return `🌾 **Kisan Health Report: ${crop}**\n` +
    `• **Disease Detected:** **${localizedName}**\n` +
    `• **Model Confidence:** ${confidence}%\n` +
    `• **Risk Level:** ${expert?.severity === 'High' ? '⚠️ High Risk (Treat within 24-48 hours)' : 'Medium (Treat promptly)'}\n\n` +
    `🔍 **Simple Signs to Spot in the Field:**\n` +
    `${expert?.symptoms || 'Leaf spots with yellowing margins.'}\n\n` +
    `🌱 **Simple Desi / Organic Solution:**\n` +
    `${expert?.organicSteps || 'Prune infected lower leaves and spray 5 ml Neem Oil (1500 ppm) per liter of water.'}\n\n` +
    `💊 **Medicine Spray & Exact Dosage:**\n` +
    `${expert?.chemicalSteps || 'Spray Mancozeb 75% WP @ 2 grams per Liter of water (approx 30g in a 15-liter spray tank).'}\n\n` +
    `⚠️ **Important Kisan Precautions:**\n` +
    `• Water at the plant base/roots; **never splash water directly over wet leaves**.\n` +
    `• Spray during late afternoon (4 PM – 6 PM) when the sun is mild.\n\n` +
    `📞 **Free Govt Farmer Help:** Call **1800-180-1551** (Toll-Free Kisan Call Center).`;
};

export const queryExpertSystem = (queryText: string, cropFilter?: string, lang: string = 'en'): ExpertSystemResult => {
  const text = queryText.toLowerCase();

  // 1. Check exact disease matches
  for (const [key, item] of Object.entries(PLANT_DISEASE_KNOWLEDGE)) {
    const diseaseName = item.condition.toLowerCase();
    const cropName = item.crop.toLowerCase();
    const cleanKey = key.replace(/___/g, ' ').replace(/_/g, ' ').toLowerCase();

    if (
      text.includes(diseaseName) ||
      cleanKey.split(' ').every(word => word.length > 3 && text.includes(word)) ||
      (cropFilter && cropName.includes(cropFilter.toLowerCase()) && text.includes(item.severity.toLowerCase()))
    ) {
      return {
        source: 'expert_system',
        title: item.condition,
        crop: item.crop,
        severity: item.severity,
        content: formatFarmerFriendlyDiagnosis(key, item.crop, item.condition, 95.0, lang)
      };
    }
  }

  // 2. Check general farming rules (fertilizer, irrigation, pests, helpline)
  for (const rule of GENERAL_AGRI_RULES) {
    if (rule.keywords.some(kw => text.includes(kw))) {
      return {
        source: 'expert_system',
        title: 'Farming Advisory',
        content: rule.response + `\n\n*(Sourced from Kisan-Bhai Offline Expert System)*`
      };
    }
  }

  // 3. Fallback generic guidance
  return {
    source: 'expert_system',
    title: 'Agricultural Advisor Guidance',
    content: `**Kisan-Bhai Expert System Advice:**\n\n` +
      `For healthy crop development:\n` +
      `1. **Crop Health Inspection:** Inspect leaf undersides regularly for early fungal spotting or insect webbing.\n` +
      `2. **Natural Preventive Spray:** Spray 5 ml Neem Oil (1500 ppm) + 1 ml detergent per liter of water every 10-14 days.\n` +
      `3. **Soil & Irrigation:** Ensure good field drainage to prevent root rot during rainy periods.\n` +
      `4. **Government Agricultural Support:** Contact your nearest Krishi Vigyan Kendra (KVK) or dial **1800-180-1551** for free personalized agronomy support.\n\n` +
      `💡 *Tip: Add your free Gemini or Groq API key in AI Settings for full interactive conversation!*`
  };
};
