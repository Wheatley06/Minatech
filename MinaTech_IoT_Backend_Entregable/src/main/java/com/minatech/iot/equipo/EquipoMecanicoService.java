package com.minatech.iot.equipo;

import com.minatech.iot.common.ApiException;
import com.minatech.iot.domain.EquipoMecanico;
import com.minatech.iot.equipo.dto.EquipoMecanicoRequest;
import com.minatech.iot.equipo.dto.EquipoMecanicoResponse;
import com.minatech.iot.repository.EquipoMecanicoRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/**
 * Alta y edición manual de equipos mecánicos desde el panel de
 * administración del frontend. Los equipos se siguen creando también de
 * forma automática desde la telemetría MQTT (ver TelemetriaService) la
 * primera vez que se ve un "equipo_id" nuevo; esto solo cubre el caso de
 * querer darlos de alta o corregir sus datos manualmente.
 */
@Service
public class EquipoMecanicoService {

    private final EquipoMecanicoRepository equipoMecanicoRepository;

    public EquipoMecanicoService(EquipoMecanicoRepository equipoMecanicoRepository) {
        this.equipoMecanicoRepository = equipoMecanicoRepository;
    }

    public List<EquipoMecanicoResponse> listar() {
        return equipoMecanicoRepository.findAll().stream()
                .map(EquipoMecanicoResponse::desde)
                .toList();
    }

    public EquipoMecanicoResponse crear(EquipoMecanicoRequest request) {
        if (request.getId() == null) {
            throw new ApiException(
                    "Debes indicar el id del equipo (debe coincidir con el \"equipo_id\" que use su telemetría MQTT).");
        }
        if (equipoMecanicoRepository.existsById(request.getId())) {
            throw new ApiException("Ya existe un equipo mecánico con id " + request.getId() + ".");
        }

        EquipoMecanico equipo = new EquipoMecanico(
                request.getId(), request.getNombre(), request.getTipoEquipo(), request.getMarca(), request.getModelo());
        if (request.getEstado() != null) {
            equipo.setEstado(request.getEstado());
        }

        return EquipoMecanicoResponse.desde(equipoMecanicoRepository.save(equipo));
    }

    public EquipoMecanicoResponse actualizar(Long id, EquipoMecanicoRequest request) {
        EquipoMecanico equipo = equipoMecanicoRepository.findById(id)
                .orElseThrow(() -> new ApiException("No existe un equipo mecánico con id " + id, HttpStatus.NOT_FOUND));

        equipo.setNombre(request.getNombre());
        equipo.setTipoEquipo(request.getTipoEquipo());
        equipo.setMarca(request.getMarca());
        equipo.setModelo(request.getModelo());
        if (request.getEstado() != null) {
            equipo.setEstado(request.getEstado());
        }

        return EquipoMecanicoResponse.desde(equipoMecanicoRepository.save(equipo));
    }
}
