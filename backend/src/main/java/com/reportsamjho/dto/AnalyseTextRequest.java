package com.reportsamjho.dto;

public class AnalyseTextRequest {
    private String reportText;
    private String language = "english";

    public String getReportText() { return reportText; }
    public void setReportText(String reportText) { this.reportText = reportText; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
}
