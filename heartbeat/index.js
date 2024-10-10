import AIService from "./services/AIService.js"
import AIRepository from "./repository/AIRepository.js"

const repository = new AIRepository();
const aiService = new AIService(repository);

aiService.startHeartbeat(process.env.HEARTBEAT_INTERVAL || 20000);

console.log('Heartbeat service has been started.')

