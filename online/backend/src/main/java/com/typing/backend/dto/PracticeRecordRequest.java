package com.typing.backend.dto;

import com.typing.backend.entity.PracticeRecord.Difficulty;
import com.typing.backend.entity.PracticeRecord.PracticeMode;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class PracticeRecordRequest {

    @NotNull(message = "练习模式不能为空")
    private PracticeMode mode;

    @NotNull(message = "难度不能为空")
    private Difficulty difficulty;

    @NotNull
    @Min(0)
    private Integer wpm;

    @NotNull
    @Min(0)
    private Double accuracy;

    @NotNull
    @Min(1)
    private Integer durationSeconds;

    private Integer totalChars;
    private Integer correctChars;
    private Integer errorCount;

    // Getters and Setters
    public PracticeMode getMode() { return mode; }
    public void setMode(PracticeMode mode) { this.mode = mode; }

    public Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }

    public Integer getWpm() { return wpm; }
    public void setWpm(Integer wpm) { this.wpm = wpm; }

    public Double getAccuracy() { return accuracy; }
    public void setAccuracy(Double accuracy) { this.accuracy = accuracy; }

    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }

    public Integer getTotalChars() { return totalChars; }
    public void setTotalChars(Integer totalChars) { this.totalChars = totalChars; }

    public Integer getCorrectChars() { return correctChars; }
    public void setCorrectChars(Integer correctChars) { this.correctChars = correctChars; }

    public Integer getErrorCount() { return errorCount; }
    public void setErrorCount(Integer errorCount) { this.errorCount = errorCount; }
}
