package com.typing.backend.controller;

import com.typing.backend.dto.ApiResponse;
import com.typing.backend.dto.LoginRequest;
import com.typing.backend.dto.RegisterRequest;
import com.typing.backend.entity.User;
import com.typing.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    /**
     * 注册
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ApiResponse<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User user = userService.register(request);
            Map<String, Object> data = userService.getUserSummary(user.getId());
            return ApiResponse.success("注册成功", data);
        } catch (RuntimeException e) {
            return ApiResponse.error(400, e.getMessage());
        }
    }

    /**
     * 登录
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        try {
            User user = userService.login(request);
            Map<String, Object> data = userService.getUserSummary(user.getId());
            return ApiResponse.success("登录成功", data);
        } catch (RuntimeException e) {
            return ApiResponse.error(401, e.getMessage());
        }
    }

    /**
     * 获取用户信息
     * GET /api/auth/profile/{userId}
     */
    @GetMapping("/profile/{userId}")
    public ApiResponse<Map<String, Object>> getProfile(@PathVariable Long userId) {
        try {
            Map<String, Object> data = userService.getUserSummary(userId);
            return ApiResponse.success(data);
        } catch (RuntimeException e) {
            return ApiResponse.error(404, e.getMessage());
        }
    }
}
