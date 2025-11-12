function isAnimalBiteComplaint(text) {
  if (!text) return false;
  const t = String(text).toLowerCase();
  const kws = ['animal bite', 'dog bite', 'cat bite', 'monkey bite', 'rat bite', 'fox bite', 'scratch', 'lick', 'rabies'];
  return kws.some(k => t.includes(k));
}

function getAnimalBiteExplanation(category) {
  const explanations = {
    'Animal Bite Category I': 'Minor animal contact with intact skin. Low rabies risk. Clean wound thoroughly and monitor for signs of infection.',
    'Animal Bite Category II': 'Nibbling or minor scratches with bleeding. Moderate rabies risk. Requires wound cleaning and rabies vaccination series.',
    'Animal Bite Category III': 'Deep bite wounds or scratches. High rabies risk. Requires immediate wound cleaning, rabies vaccination, and immunoglobulin.',
    'Animal Bite Category 1': 'Minor animal contact with intact skin. Low rabies risk. Clean wound thoroughly and monitor for signs of infection.',
    'Animal Bite Category 2': 'Nibbling or minor scratches with bleeding. Moderate rabies risk. Requires wound cleaning and rabies vaccination series.',
    'Animal Bite Category 3': 'Deep bite wounds or scratches. High rabies risk. Requires immediate wound cleaning, rabies vaccination, and immunoglobulin.',
  };
  return explanations[category] || `Animal bite exposure requiring medical evaluation. Please consult with a healthcare provider for proper assessment and treatment.`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const {
    complaint,
    age,
    systolic_bp,
    diastolic_bp,
    temperature_c,
    weight_kg,
    heart_rate_bpm,
    resp_rate_cpm,
  } = req.body || {};

  const body = {
    complaint,
    age,
    systolic_bp,
    diastolic_bp,
    temperature_c,
    weight_kg,
    heart_rate_bpm,
    resp_rate_cpm,
  };

  const isAnimal = isAnimalBiteComplaint(complaint);
  const endpoint = (process.env.ML_API_URL || '') + (isAnimal ? '/predict-animal-bite' : '/predict');

  try {
    const flaskRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await flaskRes.json();
    if (!flaskRes.ok) {
      res.status(flaskRes.status).json({ error: data?.error || 'ML API failed' });
      return;
    }

    if (isAnimal) {
      // Shape for existing UI: show the category as the top prediction
      const cat = data.category || 'Animal Bite Category 2';
      const prob = typeof data.category_confidence === 'number' ? data.category_confidence : 0.9;
      const explanation = getAnimalBiteExplanation(cat);
      res.status(200).json({
        top3: [ { diagnosis: cat, probability: prob, explanation: explanation } ],
        category: cat,
        category_confidence: prob,
        treatment: data.treatment,
        urgency_level: data.urgency_level,
      });
      return;
    }

    // General path: pass through top3 with explanations
    res.status(200).json({ top3: data.top3 || [] });
  } catch (err) {
    res.status(500).json({ error: 'ML API failed' });
  }
}
