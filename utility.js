/**
 * Decides if the next message gets thrown out or not when the rate limit is hit.
 * 
 * True - Queues up this message instead of discarding
 * False - Discards message
 */
let lastMessageSentIsCrucial = false;

function sendingCrucialMessage(isCrucial) {
    lastMessageSentIsCrucial = isCrucial;
}

async function loadJson(filePath) {
    try {
        return await import(filePath, {
            assert: {
                type: "json"
            }
        });
    } catch (err) {
        return null;
    }
};

export { loadJson, sendingCrucialMessage, lastMessageSentIsCrucial };