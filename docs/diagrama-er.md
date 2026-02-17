# Diagrama Entidad-Relación (Mantenimientos)

```mermaid
erDiagram
    USERS {
        bigint id PK
        string name
        string email
    }

    PERSON {
        bigint idperson PK
        string name
        string employment
        bigint iduser FK
        tinyint state
    }

    AGENCIES {
        bigint idagencie PK
        string name
        text localitation
    }

    TYPEFIXEDASSET {
        bigint idtypefixedasset PK
        string name
        text description
    }

    NETWORKS {
        bigint idnetwork PK
        string username
        string segment
        string ipadress
        string hostname
        string operativesystem
        string antivirus
    }

    HARDWARE {
        bigint idhardware PK
        string processor
        string ram
        string motherboard
        string graphicscard
        string ssddisk
        string hdddisk
        bigint idnetwork FK
    }

    SOFTWARE {
        bigint idsoftware PK
        string name
        text description
    }

    HARDWARESOFTWARE {
        bigint idhardwareSoftware PK
        bigint idhardware FK
        bigint idsoftware FK
    }

    FIXEDASSET {
        bigint idfixedasset PK
        bigint idtypefixedasset FK
        date datepurchase
        string brand
        string model
        bigint idhardware FK
        string color
        string serial
        bigint idagencie FK
        string location
        bigint idperson FK
        tinyint state
    }

    HARDWAREMAINTENANCE {
        bigint idhardwaremaintenance PK
        string processor
        decimal ram
        string motherboard
        string graphiccard
        decimal ssddisk
        decimal hdddisk
    }

    MAINTENANCE {
        bigint idmaintenance PK
        bigint idhardwaremaintenance FK
        string type
        bigint idfixedasset FK
        date date
        string diagnostic
        string workdone
        string observation
        bigint idagencie FK
        string location
        bigint idperson FK
        bigint iduser FK
    }

    USERS ||--o{ PERSON : crea
    USERS ||--o{ MAINTENANCE : registra

    PERSON ||--o{ FIXEDASSET : responsable
    PERSON ||--o{ MAINTENANCE : atiende

    AGENCIES ||--o{ FIXEDASSET : ubica
    AGENCIES ||--o{ MAINTENANCE : sede

    TYPEFIXEDASSET ||--o{ FIXEDASSET : clasifica
    NETWORKS ||--o{ HARDWARE : conecta

    HARDWARE ||--o{ FIXEDASSET : componente
    HARDWARE ||--o{ HARDWARESOFTWARE : tiene
    SOFTWARE ||--o{ HARDWARESOFTWARE : instalado

    FIXEDASSET ||--o{ MAINTENANCE : recibe
    HARDWAREMAINTENANCE ||--o{ MAINTENANCE : detalle
```

## Nota
- Este diagrama está basado en las migraciones actuales de `database/migrations`.
- Algunos nombres de tabla/campo se dejaron tal cual en el proyecto (por ejemplo `person`, `idagencie`, `typefixedasset`).
