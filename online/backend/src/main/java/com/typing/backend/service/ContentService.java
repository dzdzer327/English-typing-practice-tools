package com.typing.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.typing.backend.dto.WordItem;
import com.typing.backend.repository.UserSentencePracticeRepository;
import com.typing.backend.repository.UserWordPracticeRepository;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class ContentService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final UserWordPracticeRepository wordPracticeRepository;
    private final UserSentencePracticeRepository sentencePracticeRepository;

    // 练习次数阈值，超过则不再出现
    private static final int WORD_MASTERY_THRESHOLD = 5;
    private static final int SENTENCE_MASTERY_THRESHOLD = 3;

    // 离线词库（从 words.json 加载）
    private List<String> beginnerWords = new ArrayList<>();
    private List<String> intermediateWords = new ArrayList<>();
    private List<String> advancedWords = new ArrayList<>();
    private Map<String, String> wordTranslations = new HashMap<>();

    // 离线句子库（从 content.json 加载）
    private List<String> beginnerSentences = new ArrayList<>();
    private List<String> intermediateSentences = new ArrayList<>();
    private List<String> advancedSentences = new ArrayList<>();

    // 离线文章库（从 content.json 加载）
    private List<String> techArticles = new ArrayList<>();
    private List<String> scienceArticles = new ArrayList<>();
    private List<String> lifeArticles = new ArrayList<>();

    public ContentService(UserWordPracticeRepository wordPracticeRepository,
                          UserSentencePracticeRepository sentencePracticeRepository) {
        this.wordPracticeRepository = wordPracticeRepository;
        this.sentencePracticeRepository = sentencePracticeRepository;
    }

    @PostConstruct
    public void init() {
        loadWords();
        loadWordTranslations();
        loadContent();
    }

    private void loadWords() {
        try {
            ClassPathResource resource = new ClassPathResource("words.json");
            try (InputStream is = resource.getInputStream()) {
                Map<String, List<String>> data = objectMapper.readValue(is, new TypeReference<>() {});
                beginnerWords = data.getOrDefault("beginner", new ArrayList<>());
                intermediateWords = data.getOrDefault("intermediate", new ArrayList<>());
                advancedWords = data.getOrDefault("advanced", new ArrayList<>());
                System.out.println("词库加载完成: 初级=" + beginnerWords.size() +
                        ", 中级=" + intermediateWords.size() +
                        ", 高级=" + advancedWords.size());
            }
        } catch (IOException e) {
            System.err.println("词库加载失败: " + e.getMessage());
            beginnerWords = List.of("the", "be", "to", "of", "and");
            intermediateWords = List.of("computer", "keyboard", "practice");
            advancedWords = List.of("sophisticated", "comprehensive");
        }
    }

    private void loadWordTranslations() {
        try {
            ClassPathResource resource = new ClassPathResource("word_translations.json");
            try (InputStream is = resource.getInputStream()) {
                wordTranslations = objectMapper.readValue(is, new TypeReference<>() {});
                System.out.println("单词翻译加载完成: " + wordTranslations.size());
            }
        } catch (IOException e) {
            System.err.println("单词翻译加载失败: " + e.getMessage());
            wordTranslations = new HashMap<>();
        }
    }

    @SuppressWarnings("unchecked")
    private void loadContent() {
        try {
            ClassPathResource resource = new ClassPathResource("content.json");
            try (InputStream is = resource.getInputStream()) {
                Map<String, Object> data = objectMapper.readValue(is, new TypeReference<>() {});

                Map<String, List<String>> sentencesMap = (Map<String, List<String>>) data.get("sentences");
                if (sentencesMap != null) {
                    beginnerSentences = sentencesMap.getOrDefault("beginner", new ArrayList<>());
                    intermediateSentences = sentencesMap.getOrDefault("intermediate", new ArrayList<>());
                    advancedSentences = sentencesMap.getOrDefault("advanced", new ArrayList<>());
                }

                Map<String, List<String>> articlesMap = (Map<String, List<String>>) data.get("articles");
                if (articlesMap != null) {
                    techArticles = articlesMap.getOrDefault("technology", new ArrayList<>());
                    scienceArticles = articlesMap.getOrDefault("science", new ArrayList<>());
                    lifeArticles = articlesMap.getOrDefault("life", new ArrayList<>());
                }

                System.out.println("内容库加载完成: 句子=" +
                        (beginnerSentences.size() + intermediateSentences.size() + advancedSentences.size()) +
                        ", 文章=" + (techArticles.size() + scienceArticles.size() + lifeArticles.size()));
            }
        } catch (IOException e) {
            System.err.println("内容库加载失败: " + e.getMessage());
        }
    }

    /**
     * 获取随机单词（排除已掌握的）
     */
    public List<String> getWords(Long userId, String level, int count) {
        List<String> wordList;
        switch (level) {
            case "intermediate":
                wordList = intermediateWords;
                break;
            case "advanced":
                wordList = advancedWords;
                break;
            default:
                wordList = beginnerWords;
                break;
        }

        // 获取已掌握的单词
        Set<String> masteredWords = new HashSet<>(
            wordPracticeRepository.findMasteredWords(userId, WORD_MASTERY_THRESHOLD)
        );

        // 过滤掉已掌握的
        List<String> available = new ArrayList<>();
        for (String word : wordList) {
            if (!masteredWords.contains(word)) {
                available.add(word);
            }
        }

        // 如果可用单词不足，重置一部分
        if (available.size() < count) {
            available = new ArrayList<>(wordList);
        }

        return weightedSample(available, count);
    }

    public List<WordItem> getWordItems(Long userId, String level, int count) {
        return getWords(userId, level, count).stream()
                .map(word -> new WordItem(word, getTranslation(word)))
                .toList();
    }

    private String getTranslation(String word) {
        String translation = wordTranslations.get(word);
        if (translation == null) {
            translation = wordTranslations.get(word.toLowerCase(Locale.ROOT));
        }
        return translation == null ? "暂无翻译" : translation;
    }

    private List<String> weightedSample(List<String> words, int count) {
        List<String> pool = new ArrayList<>(words);
        List<String> result = new ArrayList<>();
        int targetSize = Math.min(count, pool.size());

        while (result.size() < targetSize) {
            double totalWeight = 0;
            for (int i = 0; i < pool.size(); i++) {
                totalWeight += frequencyWeight(i);
            }

            double pick = ThreadLocalRandom.current().nextDouble(totalWeight);
            double cursor = 0;
            for (int i = 0; i < pool.size(); i++) {
                cursor += frequencyWeight(i);
                if (cursor >= pick) {
                    result.add(pool.remove(i));
                    break;
                }
            }
        }

        return result;
    }

    private double frequencyWeight(int index) {
        return 1.0 / Math.pow(index + 12, 0.85);
    }

    /**
     * 获取随机句子（排除已掌握的）
     */
    public List<String> getSentences(Long userId, String level, int count) {
        List<String> sentenceList;
        switch (level) {
            case "intermediate":
                sentenceList = intermediateSentences;
                break;
            case "advanced":
                sentenceList = advancedSentences;
                break;
            default:
                sentenceList = beginnerSentences;
                break;
        }

        // 获取已掌握的句子
        Set<String> masteredHashes = new HashSet<>(
            sentencePracticeRepository.findMasteredSentences(userId, SENTENCE_MASTERY_THRESHOLD)
        );

        // 过滤掉已掌握的
        List<String> available = new ArrayList<>();
        for (String sentence : sentenceList) {
            String hash = hashSentence(sentence);
            if (!masteredHashes.contains(hash)) {
                available.add(sentence);
            }
        }

        if (available.size() < count) {
            available = new ArrayList<>(sentenceList);
        }

        Collections.shuffle(available);
        return available.subList(0, Math.min(count, available.size()));
    }

    /**
     * 获取文章
     */
    public List<String> getArticles(String topic, int count) {
        List<String> articleList;
        switch (topic) {
            case "science":
                articleList = scienceArticles;
                break;
            case "life":
                articleList = lifeArticles;
                break;
            default:
                articleList = techArticles;
                break;
        }

        List<String> shuffled = new ArrayList<>(articleList);
        Collections.shuffle(shuffled);
        return shuffled.subList(0, Math.min(count, shuffled.size()));
    }

    /**
     * 计算句子的哈希值（用于去重）
     */
    public String hashSentence(String sentence) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(sentence.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            return String.valueOf(sentence.hashCode());
        }
    }

    public int getWordMasteryThreshold() {
        return WORD_MASTERY_THRESHOLD;
    }

    public int getSentenceMasteryThreshold() {
        return SENTENCE_MASTERY_THRESHOLD;
    }
}
