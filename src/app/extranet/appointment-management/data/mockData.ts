import{AppointmentInterface} from '../interfaces/appointment-interface';

function getAppointmentMockData(): Array<AppointmentInterface> {
    const appointmentList = [];
    const allMedicalCenter = true;
    const allCommunityMedicalCenter = true;
    const allProvinceMedicalCenter = true;
    let active = true;
    const accepted = false;
    for (let x = 1; x <= 1000; x++) {
      appointmentList.push(
          {
        id: x,
        company: {
          id: x,
              nombre: 'Empresa ' + x
        },
        center: {
          id: x,
              nombre: 'Centro ' + x
        },
        name: 'Empresa' + x,
        active,
        accepted,
        allMedicalCenter,
        allCommunityMedicalCenter,
        allProvinceMedicalCenter
      });
      active = !active;
    }
    // test 1
    appointmentList[0].allMedicalCenter = false;
    appointmentList[0].allCommunityMedicalCenter = false;
    appointmentList[0].allProvinceMedicalCenter = false;
    appointmentList[0].selectedMedicalCenterList = [
      {
        "id": 22584,
        "name": "GESTIÓN SANITARIA EUROPA S.L.",
        "medicalCenterStreet": "Avda. España, nº26 11300 La Línea",
        "locationName": "LINEA DE LA CONCEPCION, LA"
      },
      {
        "id": 14504,
        "name": "CENTRO MEDICO LINENSE",
        "medicalCenterStreet": "AVDA. DE ESPAÑA, 17",
        "locationName": "LINEA DE LA CONCEPCION, LA"
      },
      {
        "id": 4569,
        "name": "CLINICA HOTEL UNIVERSAL GESTION SANITARIA, S.L.",
        "medicalCenterStreet": "PASAJE UNIVERSAL S/N",
        "locationName": "LINEA DE LA CONCEPCION, LA"
      },
      {
        "id": 21584,
        "name": "CENTRO SANITARIO C.T.C.I",
        "medicalCenterStreet": "C/ JARDINES, Nº 26",
        "locationName": "CHICLANA DE LA FRONTERA"
      },
      {
        "id": 82,
        "name": "CENTRO MEDICO CHICLANA ",
        "medicalCenterStreet": "C/ Ayala, nº2",
        "locationName": "CHICLANA DE LA FRONTERA"
      },
      {
        "id": 10040,
        "name": "JEREZ DE LA FRONTERA",
        "locationName": "JEREZ DE LA FRONTERA"
      },
      {
        "id": 4300,
        "name": "DR. LUIS MIGUEL ROSALES GARCIA",
        "medicalCenterStreet": "C/ REPUBLICA DOMINICANA, Nº 2 LOCAL 1",
        "locationName": "ARCOS DE LA FRONTERA"
      },
      {
        "id": 624,
        "name": "CEMER VILLAMARTIN (LOS ANGELES)",
        "medicalCenterStreet": "AV/ DE LA FERIA 43",
        "locationName": "VILLAMARTIN"
      },
      {
        "id": 1165,
        "name": "CENTRO MEDICO SAN SEBASTIAN",
        "medicalCenterStreet": "C/EL TORNO DOÑANA, Nº 2 PARQUE ANDALUZ (FRENTE POLICIA LOCAL)",
        "locationName": "CONIL DE LA FRONTERA"
      },
      {
        "id": 22184,
        "name": "CENTRO DE ESTUDIOS ZAFRAMAGON S.L",
        "medicalCenterStreet": "C/ CORDEL, Nº 5 BJ. ",
        "locationName": "OLVERA"
      },
      {
        "id": 4382,
        "name": "OLVEMEDIC, S.L.",
        "medicalCenterStreet": "AVDA. JULIAN BESTEIRO, S/N",
        "locationName": "OLVERA"
      },
      {
        "id": 2199,
        "name": "CENTRO MEDICO ASIDONENSE",
        "medicalCenterStreet": "P. IND. PRADO DE LA FERIA, AVDA. DE EUROPA 11",
        "locationName": "MEDINA-SIDONIA"
      },
      {
        "id": 22304,
        "name": "CENTRO MEDICO NUESTRA SEÑORA DE LOS REMEDIOS",
        "medicalCenterStreet": "AVENIDA FERNANDO QUIÑONES, 1",
        "locationName": "UBRIQUE"
      },
      {
        "id": 15984,
        "name": "UBRIQUE SALUD, S.L.",
        "medicalCenterStreet": "C/ SAN ANTONIO, Nº7",
        "locationName": "UBRIQUE"
      },
      {
        "id": 10039,
        "name": "CADIZ",
        "locationName": "CADIZ"
      },
      {
        "id": 12165,
        "name": "INNOVA PREVENCION",
        "medicalCenterStreet": "C/ REAL FERNANDO LOCAL 4",
        "locationName": "SANLUCAR DE BARRAMEDA"
      },
      {
        "id": 1124,
        "name": "POLICLINICA GIRME",
        "medicalCenterStreet": "CTRA. PUERTO-ROTA, KM 5 ",
        "locationName": "PUERTO DE SANTA MARIA, EL"
      },
      {
        "id": 10021,
        "name": "ALGECIRAS",
        "locationName": "ALGECIRAS"
      },
      {
        "id": 3239,
        "name": "CENTRO MEDICO COSTA DE LA LUZ",
        "medicalCenterStreet": "C/ PERPETUO SOCORRO, Nº 2 ESQUINA AVDA. GRANADA",
        "locationName": "CHIPIONA"
      },
      {
        "id": 644,
        "name": "CENTRO MEDICO COSTA DE LA LUZ",
        "medicalCenterStreet": "C/ SAN JUAN BOSCO 11",
        "locationName": "ROTA"
      },
      {
        "id": 4574,
        "name": "C.A.M. EL CARMEN, S.C.",
        "medicalCenterStreet": "AVDA. JUAN CARLOS I, S/N",
        "locationName": "BARBATE"
      },
      {
        "id": 4939,
        "name": "CENTRO SANITARIO EL VALLE",
        "medicalCenterStreet": "C/ CAÑETE, Nº 8",
        "locationName": "ALCALA DEL VALLE"
      },
      {
        "id": 18644,
        "name": "MARBELLA HEALTH CARE SERVICES, SL",
        "medicalCenterStreet": "C/ REINA DE LOS ANGELES, 23",
        "locationName": "JIMENA DE LA FRONTERA"
      },
      {
        "id": 18664,
        "name": "MARBELLA HEALTH CARE SERVICES, SL",
        "medicalCenterStreet": "CC SOTMARKET LOCAL 49, AUTOVIA A7 KM 130",
        "locationName": "SOTOGRANDE"
      },
        {
          "id": 10048,
          "name": "JAEN",
          "locationName": "JAEN"
        },
        {
          "id": 4918,
          "name": "LICLINIC (GEMA RUIZ LOZANO)",
          "medicalCenterStreet": "AVDA. ANDALUCIA, 9 BAJO",
          "locationName": "LINARES"
        }
    ];
    appointmentList[0].selectedCommunityList = [
      {
        "id": 14,
        "name": "ANDALUCIA",
      },
      {
        "id": 19,
        "name": "CANARIAS",
      }
    ];
    appointmentList[0].selectedProvinceList = [
      {
        "id": 11,
        "name": "CADIZ",
      },
      {
        "id": 23,
        "name": "JAEN",
      }
    ];

    // test 2
    appointmentList[1].allMedicalCenter = true;
    appointmentList[1].allCommunityMedicalCenter = true;
    appointmentList[1].allProvinceMedicalCenter = true;
    appointmentList[1].selectedMedicalCenterList = [];
    appointmentList[1].selectedCommunityList = [];
    appointmentList[1].selectedProvinceList = [];

    // test 3
    appointmentList[2].allMedicalCenter = false;
    appointmentList[2].allCommunityMedicalCenter = false;
    appointmentList[2].allProvinceMedicalCenter = false;
    appointmentList[2].selectedMedicalCenterList = [
      {
        "id": 22584,
        "name": "GESTIÓN SANITARIA EUROPA S.L.",
        "medicalCenterStreet": "Avda. España, nº26 11300 La Línea",
        "locationName": "LINEA DE LA CONCEPCION, LA"
      }
    ];
    appointmentList[2].selectedCommunityList = [
      {
        "id": 14,
        "name": "ANDALUCIA",
      },
      {
        "id": 19,
        "name": "CANARIAS",
      }
    ];
    appointmentList[2].selectedProvinceList = [
      {
        "id": 11,
        "name": "CADIZ",
      },
      {
        "id": 23,
        "name": "JAEN",
      }
    ];

    return appointmentList;
  }

  export { getAppointmentMockData }
