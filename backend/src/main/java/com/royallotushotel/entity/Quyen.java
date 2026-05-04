package com.royallotushotel.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "quyen")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quyen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ten", unique = true, nullable = false, length = 100)
    private String ten;
}
