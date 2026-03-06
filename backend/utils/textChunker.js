 /**
 * Splits text into smaller chunks of a given size
 * @param {string} text - The input text to chunk
 * @param {number} chunkSize - Max characters per chunk
 * @param {number} overlap - Number of characters to overlap between chunks
 * @returns {string[]} Array of text chunks
 */
export const chunkText = (text, chunkSize = 500, overlap = 50) => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  //clean text while preserving paragraphs structure
    const cleanedText = text
    .replace(/\r\n/g, '\n') // Normalize newlines
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .replace(/\n/g, '\n') // Ensure newlines are preserved
    .replace(/ \n/g, '\n') // Remove spaces before newlines
    .trim();

    // try to split by paragraphs first
    const paragraphs = cleanedText.split(/\n+/).filter(p => p.trim().length > 0);
    const chunks = [];
    let currentChunk = [];
    let currentWordCount = 0;
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
        const paragraphWord = paragraph.trim().split(/\s+/);
        const paragraphWordCount = paragraphWord.length;

        //if single paragraph exceeds chunk size, split it into smaller parts
        if (paragraphWordCount > chunkSize) {
            if (currentChunk.length > 0) {
                chunks.push({
                    content: currentChunk.join('\n\n '),
                    chunkIndex: chunkIndex++,
                    pageNumber: 0
                });
                currentChunk = [];
                currentWordCount = 0;
            }

            // split long paragraph into smaller chunks
            for (let i = 0; i < paragraphWordCount; i += chunkSize - overlap) {
                const chunkWords = paragraphWord.slice(i, i + chunkSize);
                chunks.push({
                    content: chunkWords.join(' '),
                    chunkIndex: chunkIndex++,
                    pageNumber: 0
                });

                if (i + chunkSize >= paragraphWordCount) {
                    break;
                }
            }
            continue;
        }

        // if adding the paragraph exceeds chunk size, start a new chunk
        if (currentWordCount + paragraphWordCount > chunkSize) {
            chunks.push({
                content: currentChunk.join('\n\n '),
                chunkIndex: chunkIndex++,
                pageNumber: 0
            });

            //create overlap with previous chunk
            const prevChunkText = currentChunk.join(' ');
            const prevWords = prevChunkText.split(/\s+/);
            const overlapWords = prevWords.slice(-overlap);

            currentChunk = [overlapText, paragraph.trim()];
            currentWordCount = overlapWords.length + paragraphWordCount;
        } else {
            currentChunk.push(paragraph.trim());
            currentWordCount += paragraphWordCount; 
        }
    }

    // push any remaining text as a final chunk
    if (currentChunk.length > 0) {
        chunks.push({
            content: currentChunk.join('\n\n '),
            chunkIndex: chunkIndex++,
            pageNumber: 0
        });
    }

    // fallback: if no paragraphs were detected, split by words
    if (chunks.length === 0) {
        const words = cleanedText.split(/\s+/);
        for (let i = 0; i < words.length; i += chunkSize - overlap) {
            const chunkWords = words.slice(i, i + chunkSize);
            chunks.push({
                content: chunkWords.join(' '),
                chunkIndex: chunkIndex++,
                pageNumber: 0
            });
            if (i + chunkSize >= words.length) {
                break;
            }
        }
    }

    return chunks;
};

/**
 * find relevant chunks based on keyword matching
 * @param {Array<Object>} chunks - Array of text chunks with content and metadata
 * @param {string} query - User query to match against chunk content
 * @param {number} maxChunks - Number of top relevant chunks to return
 * @return {Array<Object>} Array of relevant chunks sorted by relevance
 */
export const findRelevantChunks = (chunks, query, maxChunks = 5) => {
    if (!chunks || chunks.length === 0 || !query || query.trim().length === 0) {
        return [];
    }

    //common stop words to ignore in relevance scoring
    const stopWords = new Set(['the', 'is', 'in', 'and', 'to', 'of', 'a', 'that', 'it', 'with', 'as', 'for', 'was', 'on', 'are', 'by', 'this', 'be']);

    const queryWords = query.toLowerCase().split(/\s+/).filter(w => !stopWords.has(w));

    if (queryWords.length === 0) {
        // return clean chunk objects without mongoose metadat
        return chunks.slice(0, maxChunks).map(chunk => ({
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            _id: chunk._id
        }));
    }

    const scoredChunks = chunks.map((chunk, index) => {
        const content = chunk.content.toLowerCase();
        const contentWords = new Set(content.split(/\s+/));
        let score = 0;

        //score each query word based on presence in chunk content
        for (const word of queryWords) {
            // eaxact match
            const exactMatches = (content.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
            score += exactMatches * 3; // higher weight for exact matches

            // partial match (substring)
            const partialMatches = (content.match(new RegExp(word, 'g')) || []).length;
            score += Math.max(0, partialMatches - exactMatches) * 1.5; // lower weight for partial matches
        }

        // Bonus: multiplr query found
        const uniqueWordFound = queryWords.filter(word =>
            content.includes(word)
        ).length;
        if (uniqueWordFound > 1) {
            score += uniqueWordFound * 2; // bonus for multiple query words found
        }

        // normalize by content length to avoid bias towards longer chunks
        const normalizedScore = score / Math.sqrt(contentWords.size);

        // small bous for earlier chunks to prefer more relevant content
        const positionBonus = 1 - (index / chunks.length) * 0.5; // up to 50% bonus for earlier chunks

        // return clean object without mongoose metadata
        return {
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            _id: chunk._id,
            score: normalizedScore * positionBonus,
            rawScore: score,
            matchedWords: uniqueWordFound
        };
    });

    return scoredChunks
        .filter(chunk => chunk.score > 0) // filter out irrelevant chunks
        .sort((a, b) => {
            if (b.score === a.score) {
                return b.score - a.score; // sort by raw score if normalized scores are equal
            }
            if (b.matchedWords === a.matchedWords) {
                return b.matchedWords - a.matchedWords; // sort by number of matched words if scores are equal
            }
            return a.chunkIndex - b.chunkIndex; // prefer earlier chunks if all else is equal   
        })
        .slice(0, maxChunks); // return top relevant chunks
        };

        