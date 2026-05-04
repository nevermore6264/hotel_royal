package com.royallotushotel.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "vai_tro")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VaiTro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ten", unique = true, nullable = false, length = 50)
    private String ten;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "vai_tro_quyen",
            joinColumns = @JoinColumn(name = "id_vai_tro"),
            inverseJoinColumns = @JoinColumn(name = "id_quyen"))
    @Builder.Default
    private Set<Quyen> quyen = new HashSet<>();
}
