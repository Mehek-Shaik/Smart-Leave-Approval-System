package com.smartleave.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configure(http))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/students/register", "/students/login",
                    "/mentors/register", "/mentors/login",
                    "/parents/register", "/parents/login",
                    "/classincharges/register", "/classincharges/login",
                    "/hods/register", "/hods/login",
                    "/security/login", "/admin/login",
                    "/api-docs/**", "/swagger-ui/**", "/swagger-ui.html"
                ).permitAll()
                .requestMatchers("/leave/apply", "/leave/my-leaves").hasAuthority("ROLE_STUDENT")
                .requestMatchers("/mentors/**").hasAuthority("ROLE_MENTOR")
                .requestMatchers("/parents/**").hasAuthority("ROLE_PARENT")
                .requestMatchers("/classincharges/**").hasAuthority("ROLE_CLASS_INCHARGE")
                .requestMatchers("/hods/**").hasAuthority("ROLE_HOD")
                .requestMatchers("/otp/**", "/security/**").hasAnyAuthority("ROLE_SECURITY", "ROLE_ADMIN")
                .requestMatchers("/admin/**").hasAuthority("ROLE_ADMIN")
                .anyRequest().authenticated()
            );

        return http.build();
    }
}
