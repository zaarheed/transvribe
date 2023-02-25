const templates = [
    `I created a Chat GPT bot for videos. You can use it to ask this video any question! Try it here: `,
    `I created a chat bot for videos so you can ask it any question. Try asking "what is this video about?" `,
    `I built a GPT bot that answers any question about any video on YouTube. Try asking it "What is this video about?" `
]

export default function generateRedditMessage() {
    const randomIndex = Math.floor(Math.random() * templates.length);
    const response = templates[randomIndex];
    return response;
}