package com.smartleave.controller;

import com.smartleave.dto.AuthResponse;
import com.smartleave.dto.LoginRequest;
import com.smartleave.entity.Student;
import com.smartleave.repository.StudentRepository;
import com.smartleave.security.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/students")
@Tag(name = "Student Module", description = "Student registration, authentication and profile")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/register")
    @Operation(summary = "Register a new student")
    public ResponseEntity<?> register(@Valid @RequestBody Student student) {
        if (studentRepository.existsByEmail(student.getEmail())) {
            return ResponseEntity.badRequest().body("Email already registered");
        }
        if (studentRepository.existsByRollNumber(student.getRollNumber())) {
            return ResponseEntity.badRequest().body("Roll number already registered");
        }

        student.setPassword(passwordEncoder.encode(student.getPassword()));
        student.setRole("ROLE_STUDENT");
        Student saved = studentRepository.save(student);

        Map<String, Object> claims = new HashMap<>();
        claims.put("department", saved.getDepartment());
        claims.put("year", saved.getYear());
        claims.put("section", saved.getSection());
        claims.put("rollNumber", saved.getRollNumber());

        String token = jwtService.generateToken(saved.getEmail(), "ROLE_STUDENT", claims);
        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(token, "Registered successfully", saved));
    }

    @PostMapping("/login")
    @Operation(summary = "Student login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Student student = studentRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), student.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("department", student.getDepartment());
        claims.put("year", student.getYear());
        claims.put("section", student.getSection());
        claims.put("rollNumber", student.getRollNumber());

        String token = jwtService.generateToken(student.getEmail(), "ROLE_STUDENT", claims);
        return ResponseEntity.ok(new AuthResponse(token, "Login successful", student));
    }

    @GetMapping("/profile")
    @Operation(summary = "Get student profile from JWT")
    @SecurityRequirement(name = "BearerAuth")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        Student student = studentRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        return ResponseEntity.ok(student);
    }
}
