package com.minatech.iot.mantenimiento;

import com.minatech.iot.common.ApiException;
import com.minatech.iot.domain.EquipoMecanico;
import com.minatech.iot.domain.PlanMantenimiento;
import com.minatech.iot.mantenimiento.dto.PlanMantenimientoRequest;
import com.minatech.iot.mantenimiento.dto.PlanMantenimientoResponse;
import com.minatech.iot.repository.EquipoMecanicoRepository;
import com.minatech.iot.repository.PlanMantenimientoRepository;
import java.util.Comparator;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class PlanMantenimientoService {

    private final PlanMantenimientoRepository planMantenimientoRepository;
    private final EquipoMecanicoRepository equipoMecanicoRepository;

    public PlanMantenimientoService(PlanMantenimientoRepository planMantenimientoRepository,
                                     EquipoMecanicoRepository equipoMecanicoRepository) {
        this.planMantenimientoRepository = planMantenimientoRepository;
        this.equipoMecanicoRepository = equipoMecanicoRepository;
    }

    public List<PlanMantenimientoResponse> listar() {
        return planMantenimientoRepository.findAll().stream()
                .sorted(Comparator.comparing(PlanMantenimiento::getFechaProgramada))
                .map(PlanMantenimientoResponse::desde)
                .toList();
    }

    public PlanMantenimientoResponse crear(PlanMantenimientoRequest request) {
        EquipoMecanico equipo = equipoMecanicoRepository.findById(request.getEquipoMecanicoId())
                .orElseThrow(() -> new ApiException(
                        "No existe un equipo mecanico con id " + request.getEquipoMecanicoId(),
                        HttpStatus.NOT_FOUND));

        PlanMantenimiento plan = new PlanMantenimiento(
                equipo,
                request.getTipoMantenimiento(),
                request.getFechaProgramada(),
                request.getResponsable(),
                request.getDescripcion());

        PlanMantenimiento guardado = planMantenimientoRepository.save(plan);
        return PlanMantenimientoResponse.desde(guardado);
    }
}
