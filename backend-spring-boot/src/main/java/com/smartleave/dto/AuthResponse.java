package com.smartleave.dto;

public class AuthResponse {
    private String token;
    private String message;
    private Object user;

    public AuthResponse(String token, String message, Object user) {
        this.token = token;
        this.message = message;
        this.user = user;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Object getUser() { return user; }
    public void setUser(Object user) { this.user = user; }
}
