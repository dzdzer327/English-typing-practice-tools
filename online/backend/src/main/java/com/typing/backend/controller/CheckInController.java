package com.typing.backend.controller;

import com.typing.backend.dto.ApiResponse;
import com.typing.backend.service.CheckInService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/checkin")
public class CheckInController {

    private final CheckInService checkInService;

    public CheckInController(CheckInService checkInService) {
        this.checkInService = checkInService;
    }

    /**
     * 每日打卡
     * POST /api/checkin?userId=1
     */
    @PostMapping
    public ApiResponse<Map<String, Object>> checkIn(@RequestParam Long userId) {
        try {
            Map<String, Object> result = checkInService.checkIn(userId);
            return ApiResponse.success((String) result.get("message"), result);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 获取打卡统计
     * GET /api/checkin/stats?userId=1
     */
    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getStats(@RequestParam Long userId) {
        try {
            Map<String, Object> stats = checkInService.getCheckInStats(userId);
            return ApiResponse.success(stats);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 获取打卡日历（某月）
     * GET /api/checkin/calendar?userId=1&year=2024&month=6
     */
    @GetMapping("/calendar")
    public ApiResponse<Map<String, Object>> getCalendar(
            @RequestParam Long userId,
            @RequestParam int year,
            @RequestParam int month) {
        try {
            Map<String, Object> calendar = checkInService.getCheckInCalendar(userId, year, month);
            return ApiResponse.success(calendar);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 获取打卡历史
     * GET /api/checkin/history?userId=1&limit=30
     */
    @GetMapping("/history")
    public ApiResponse<List<Map<String, Object>>> getHistory(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "30") int limit) {
        List<Map<String, Object>> history = checkInService.getCheckInHistory(userId, limit);
        return ApiResponse.success(history);
    }
}
