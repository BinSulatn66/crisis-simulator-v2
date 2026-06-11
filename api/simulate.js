export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  var body = req.body;
  var messages = body.messages;
  var system = body.system;
  var apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
  }

  // Construct Gemini content from messages
  // Gemini expects: { contents: [{ role: "user", parts: [{ text: "..." }] }] }
  // Note: Gemini 'system' instruction is usually passed as a separate parameter or prepended.
  var contents = [];
  
  if (system) {
    contents.push({
      role: "user",
      parts: [{ text: "System instructions: " + system }]
    });
    contents.push({
      role: "model",
      parts: [{ text: "Understood. I will follow those instructions." }]
    });
  }

  for (var i = 0; i < messages.length; i++) {
    var m = messages[i];
    contents.push({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content || m.text }]
    });
  }

  var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

  try {
    var response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7
        }
      })
    });

    var data = await response.json();
    
    if (data.error) {
      return res.status(response.status || 500).json({ error: data.error.message });
    }

    // Extract text from Gemini response
    // data.candidates[0].content.parts[0].text
    var generatedText = "";
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      generatedText = data.candidates[0].content.parts[0].text;
    }

    // Return in a format the frontend expects (mimicking Anthropic structure or simplified)
    res.status(200).json({
      content: [{ text: generatedText }]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
