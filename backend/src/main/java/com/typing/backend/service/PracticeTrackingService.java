package com.typing.backend.service;

import com.typing.backend.entity.User;
import com.typing.backend.entity.UserSentencePractice;
import com.typing.backend.entity.UserWordPractice;
import com.typing.backend.repository.UserRepository;
import com.typing.backend.repository.UserSentencePracticeRepository;
import com.typing.backend.repository.UserWordPracticeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class PracticeTrackingService {

    private final UserWordPracticeRepository wordPracticeRepository;
    private final UserSentencePracticeRepository sentencePracticeRepository;
    private final UserRepository userRepository;
    private final ContentService contentService;

    public PracticeTrackingService(UserWordPracticeRepository wordPracticeRepository,
                                   UserSentencePracticeRepository sentencePracticeRepository,
                                   UserRepository userRepository,
                                   ContentService contentService) {
        this.wordPracticeRepository = wordPracticeRepository;
        this.sentencePracticeRepository = sentencePracticeRepository;
        this.userRepository = userRepository;
        this.contentService = contentService;
    }

    /**
     * 记录单词练习
     */
    @Transactional
    public void recordWordPractice(Long userId, List<String> words, int correctCount, int errorCount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        for (String word : words) {
            UserWordPractice practice = wordPracticeRepository
                    .findByUserIdAndWord(userId, word)
                    .orElse(new UserWordPractice());

            if (practice.getUser() == null) {
                practice.setUser(user);
                practice.setWord(word);
                practice.setPracticeCount(0);
                practice.setCorrectCount(0);
                practice.setErrorCount(0);
            }

            practice.setPracticeCount(practice.getPracticeCount() + 1);
            practice.setCorrectCount(practice.getCorrectCount() + correctCount);
            practice.setErrorCount(practice.getErrorCount() + errorCount);
            practice.setLastPracticedAt(LocalDateTime.now());

            wordPracticeRepository.save(practice);
        }
    }

    /**
     * 记录句子练习
     */
    @Transactional
    public void recordSentencePractice(Long userId, List<String> sentences) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        for (String sentence : sentences) {
            String hash = contentService.hashSentence(sentence);

            UserSentencePractice practice = sentencePracticeRepository
                    .findByUserIdAndSentenceHash(userId, hash)
                    .orElse(new UserSentencePractice());

            if (practice.getUser() == null) {
                practice.setUser(user);
                practice.setSentenceHash(hash);
                practice.setSentenceText(sentence);
                practice.setPracticeCount(0);
            }

            practice.setPracticeCount(practice.getPracticeCount() + 1);
            practice.setLastPracticedAt(LocalDateTime.now());

            sentencePracticeRepository.save(practice);
        }
    }

    /**
     * 获取用户单词掌握情况
     */
    public Map<String, Object> getWordMasteryStats(Long userId) {
        List<UserWordPractice> all = wordPracticeRepository.findByUserId(userId);

        int mastered = 0;
        int learning = 0;
        int totalPractice = 0;

        for (UserWordPractice p : all) {
            totalPractice += p.getPracticeCount();
            if (p.getPracticeCount() >= contentService.getWordMasteryThreshold()) {
                mastered++;
            } else {
                learning++;
            }
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("mastered", mastered);
        stats.put("learning", learning);
        stats.put("totalWords", all.size());
        stats.put("totalPractice", totalPractice);
        stats.put("masteryThreshold", contentService.getWordMasteryThreshold());

        return stats;
    }

    /**
     * 获取用户句子掌握情况
     */
    public Map<String, Object> getSentenceMasteryStats(Long userId) {
        List<UserSentencePractice> all = sentencePracticeRepository.findByUserId(userId);

        int mastered = 0;
        int learning = 0;

        for (UserSentencePractice p : all) {
            if (p.getPracticeCount() >= contentService.getSentenceMasteryThreshold()) {
                mastered++;
            } else {
                learning++;
            }
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("mastered", mastered);
        stats.put("learning", learning);
        stats.put("totalSentences", all.size());
        stats.put("masteryThreshold", contentService.getSentenceMasteryThreshold());

        return stats;
    }
}
