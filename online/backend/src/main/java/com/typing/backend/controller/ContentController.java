package com.typing.backend.controller;

import com.typing.backend.dto.ApiResponse;
import com.typing.backend.dto.WordItem;
import com.typing.backend.service.ContentService;
import com.typing.backend.service.PracticeTrackingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/content")
public class ContentController {

    private final ContentService contentService;
    private final PracticeTrackingService practiceTrackingService;

    public ContentController(ContentService contentService, PracticeTrackingService practiceTrackingService) {
        this.contentService = contentService;
        this.practiceTrackingService = practiceTrackingService;
    }

    /**
     * 获取练习单词（排除已掌握的）
     * GET /api/content/words?userId=1&level=beginner&count=20
     */
    @GetMapping("/words")
    public ApiResponse<List<String>> getWords(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "beginner") String level,
            @RequestParam(defaultValue = "20") int count) {
        List<String> words = contentService.getWords(userId, level, count);
        return ApiResponse.success(words);
    }

    /**
     * 获取练习单词和中文翻译（排除已掌握的）
     * GET /api/content/word-items?userId=1&level=beginner&count=20
     */
    @GetMapping("/word-items")
    public ApiResponse<List<WordItem>> getWordItems(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "beginner") String level,
            @RequestParam(defaultValue = "20") int count) {
        List<WordItem> words = contentService.getWordItems(userId, level, count);
        return ApiResponse.success(words);
    }

    /**
     * 获取练习句子（排除已掌握的）
     * GET /api/content/sentences?userId=1&level=beginner&count=5
     */
    @GetMapping("/sentences")
    public ApiResponse<List<String>> getSentences(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "beginner") String level,
            @RequestParam(defaultValue = "5") int count) {
        List<String> sentences = contentService.getSentences(userId, level, count);
        return ApiResponse.success(sentences);
    }

    /**
     * 获取文章
     * GET /api/content/articles?topic=technology&count=1
     */
    @GetMapping("/articles")
    public ApiResponse<List<String>> getArticles(
            @RequestParam(defaultValue = "technology") String topic,
            @RequestParam(defaultValue = "1") int count) {
        List<String> articles = contentService.getArticles(topic, count);
        return ApiResponse.success(articles);
    }

    /**
     * 记录单词练习
     * POST /api/content/record-words?userId=1
     * Body: ["hello", "world", "test"]
     */
    @PostMapping("/record-words")
    public ApiResponse<String> recordWordPractice(
            @RequestParam Long userId,
            @RequestBody List<String> words) {
        practiceTrackingService.recordWordPractice(userId, words, 1, 0);
        return ApiResponse.success("记录成功");
    }

    /**
     * 记录句子练习
     * POST /api/content/record-sentences?userId=1
     * Body: ["sentence one", "sentence two"]
     */
    @PostMapping("/record-sentences")
    public ApiResponse<String> recordSentencePractice(
            @RequestParam Long userId,
            @RequestBody List<String> sentences) {
        practiceTrackingService.recordSentencePractice(userId, sentences);
        return ApiResponse.success("记录成功");
    }

    /**
     * 获取单词掌握统计
     * GET /api/content/word-stats?userId=1
     */
    @GetMapping("/word-stats")
    public ApiResponse<Map<String, Object>> getWordStats(@RequestParam Long userId) {
        Map<String, Object> stats = practiceTrackingService.getWordMasteryStats(userId);
        return ApiResponse.success(stats);
    }

    /**
     * 获取句子掌握统计
     * GET /api/content/sentence-stats?userId=1
     */
    @GetMapping("/sentence-stats")
    public ApiResponse<Map<String, Object>> getSentenceStats(@RequestParam Long userId) {
        Map<String, Object> stats = practiceTrackingService.getSentenceMasteryStats(userId);
        return ApiResponse.success(stats);
    }
}
