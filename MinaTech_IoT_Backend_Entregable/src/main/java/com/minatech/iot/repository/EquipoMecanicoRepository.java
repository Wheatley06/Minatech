package com.minatech.iot.repository;

import com.minatech.iot.domain.EquipoMecanico;
import com.minatech.iot.domain.EstadoEquipo;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipoMecanicoRepository extends JpaRepository<EquipoMecanico, Long> {

    List<EquipoMecanico> findByEstado(EstadoEquipo estado);
}
