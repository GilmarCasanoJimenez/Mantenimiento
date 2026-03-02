<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Hoja de Mantenimiento #{{ $item->idmaintenance }}</title>
    <style>
        @page {
            margin-top: 1.5cm;
            margin-right: 1.5cm;
            margin-bottom: 0.75cm;
            margin-left: 2.5cm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10px;
            color: #000;
            line-height: 1.2;
        }

        .sheet {
            width: 100%;
        }

        .logo-wrap {
            text-align: center;
            margin-bottom: 4px;
        }

        .logo-wrap img {
            width: 220px;
            height: auto;
        }

        .top-rule {
            border-top: 3px solid #000;
            margin: 3px 0 12px 0;
        }

        .main-title {
            text-align: center;
            font-weight: 700;
            font-size: 18px;
            color: #007436;
            margin-bottom: 2px;
            text-transform: uppercase;
        }

        .main-subtitle {
            text-align: center;
            font-size: 13px;
            color: #007436;
            font-weight: 700;
            margin-bottom: 12px;
        }

        .section-title {
            background: #cfcfcf;
            border: 1.3px solid #000;
            border-bottom: 0;
            padding: 5px 8px;
            font-weight: 700;
            text-transform: uppercase;
            text-align: center;
            font-size: 10px;
        }

        table.grid {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            margin-bottom: 6px;
        }

        .grid th,
        .grid td {
            border: 1.05px solid #000;
            padding: 4px 6px;
            vertical-align: top;
            word-wrap: break-word;
            font-size: 10px;
        }

        .label {
            font-weight: 700;
            text-transform: uppercase;
            background: #d9d9d9;
        }

        .value-italic {
            font-style: italic;
            font-weight: 700;
            text-align: center;
        }

        .checkbox-cell {
            text-align: center;
            vertical-align: middle;
        }

        .check-box {
            display: inline-block;
            width: 22px;
            height: 22px;
            line-height: 19px;
            border: 2px solid #5d8fcc;
            text-align: center;
            font-size: 13px;
            font-weight: 700;
            vertical-align: middle;
        }

        .line-area {
            min-height: 72px;
            padding: 2px 2px 0 2px;
        }

        .line-area-sm {
            min-height: 52px;
            padding: 2px 2px 0 2px;
        }

        .line-row {
            min-height: 12px;
            border-bottom: 1px dotted #9ca3af;
            margin-bottom: 2px;
            font-size: 10px;
            font-style: italic;
            padding: 0 2px;
        }

        .line-row:last-child {
            margin-bottom: 0;
        }

        .bullets {
            min-height: 86px;
            padding: 2px 2px 0 2px;
        }

        .bullet-line {
            min-height: 12px;
            border-bottom: 1px dotted #9ca3af;
            margin-bottom: 2px;
            padding: 0 2px;
            font-size: 10px;
            font-style: italic;
        }

        .bullet-line:last-child {
            margin-bottom: 0;
        }

        .bullet-prefix {
            display: inline-block;
            width: 9px;
            font-style: normal;
            font-weight: 700;
        }

        .signatures-wrap {
            margin-top: 30px;
        }

        .signatures {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .signatures td {
            padding: 0 10px;
            text-align: center;
            vertical-align: bottom;
            border: none;
        }

        .sign-line {
            border-top: 1px dashed #000;
            margin-top: 44px;
            padding-top: 4px;
            font-weight: 700;
            font-size: 10px;
            min-height: 24px;
            text-transform: uppercase;
        }

        .sign-line-solid {
            border-top: 1px solid #000;
        }

        .sign-sub {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
        }

        .tiny {
            font-size: 9px;
        }

        .center {
            text-align: center;
        }
    </style>
</head>
<body>
@php
    $formatDate = function ($value) {
        if (! $value) {
            return '-';
        }

        try {
            return \Carbon\Carbon::parse($value)->format('d/m/Y');
        } catch (\Throwable $e) {
            return '-';
        }
    };

    $formatStorage = function ($value) {
        if ($value === null || $value === '') {
            return '-';
        }

        return rtrim(rtrim(number_format((float) $value, 2, '.', ''), '0'), '.') . ' GB';
    };

    $formatRam = function ($value) {
        if ($value === null || $value === '') {
            return '-';
        }

        $ram = (float) $value;

        if ($ram > 0 && $ram < 1) {
            $ram *= 100;
        }

        return rtrim(rtrim(number_format($ram, 2, '.', ''), '0'), '.') . ' GB';
    };

    $description = trim(implode(' ', array_filter([
        $item->asset_type_name ? 'Tipo: ' . $item->asset_type_name . '.' : null,
        $item->brand ? 'Marca: ' . $item->brand . '.' : null,
        $item->model ? 'Modelo: ' . $item->model . '.' : null,
        $item->processor ? 'Procesador: ' . $item->processor . '.' : null,
        $item->ram !== null ? 'RAM: ' . $formatRam($item->ram) . '.' : null,
        $item->ssddisk !== null ? 'SSD: ' . $formatStorage($item->ssddisk) . '.' : null,
        $item->hdddisk !== null ? 'HDD: ' . $formatStorage($item->hdddisk) . '.' : null,
        $item->color ? 'Color: ' . $item->color . '.' : null,
    ])));

    $logoDataUri = null;
    $canRenderPng = extension_loaded('gd') || function_exists('gd_info');
    $logoCandidates = [
        ['path' => public_path('ccb_logo_fondo_blanco_complero.jpg'), 'requiresGd' => false],
        ['path' => public_path('ccb_logo_fondo_blanco_complero.png'), 'requiresGd' => true],
        ['path' => public_path('ccb_logo_transparente.png'), 'requiresGd' => true],
        ['path' => public_path('ccb_logo_fondo_verde.png'), 'requiresGd' => true],
    ];

    foreach ($logoCandidates as $candidate) {
        if ($candidate['requiresGd'] && ! $canRenderPng) {
            continue;
        }

        $logoPath = $candidate['path'];

        if (is_file($logoPath) && is_readable($logoPath)) {
            $mime = mime_content_type($logoPath) ?: 'image/jpeg';
            $content = file_get_contents($logoPath);

            if ($content !== false) {
                $logoDataUri = 'data:' . $mime . ';base64,' . base64_encode($content);
                break;
            }
        }
    }

    $diagnosticText = trim((string) ($item->diagnostic ?? ''));
    $workText = trim((string) ($item->workdone ?? ''));
    $obsText = trim((string) ($item->observation ?? ''));

    $splitBullets = function (string $text): array {
        if ($text === '') {
            return [];
        }

        $lines = preg_split('/\r\n|\r|\n/', $text) ?: [];
        $lines = array_values(array_filter(array_map('trim', $lines), static fn ($line) => $line !== ''));

        if (count($lines) <= 1) {
            $parts = preg_split('/\.\s+/', $text) ?: [];
            $lines = array_values(array_filter(array_map(static function ($part) {
                $clean = trim($part);
                return $clean === '' ? '' : rtrim($clean, '.') . '.';
            }, $parts), static fn ($line) => $line !== ''));
        }

        return $lines;
    };

    $workLines = $splitBullets($workText);
    $obsLines = $splitBullets($obsText);

    $toFixedRows = function (array $lines, int $rows): array {
        $items = array_slice($lines, 0, $rows);

        while (count($items) < $rows) {
            $items[] = '';
        }

        return $items;
    };

    $diagLines = $toFixedRows($diagnosticText !== '' ? [$diagnosticText] : ['-'], 4);
    $workRows = $toFixedRows(count($workLines) > 0 ? $workLines : ['-'], 6);
    $obsRows = $toFixedRows(count($obsLines) > 0 ? $obsLines : ['-'], 6);

    $assetCode = $item->asset_code
        ?? $item->codigo_activo
        ?? $item->code
        ?? $item->idfixedasset
        ?? '-';
@endphp

<div class="sheet">
    @if($logoDataUri)
        <div class="logo-wrap">
            <img src="{{ $logoDataUri }}" alt="Logo CCB">
        </div>
    @endif

    <div class="top-rule"></div>

    <div class="main-title">HOJA DE VIDA DEL RECURSO TECNOLÓGICO</div>
    <div class="main-subtitle">(Equipos de Cómputo)</div>

    <div class="section-title">DATOS DEL EQUIPO</div>
    <table class="grid">
    <colgroup>
        <col style="width: 18%">
        <col style="width: 32%">
        <col style="width: 18%">
        <col style="width: 32%">
    </colgroup>
    <tr>
        <td class="label">CÓDIGO DE ACTIVO:</td>
        <td>{{ $assetCode }}</td>
        <td class="label">ID:</td>
        <td>{{ $item->idmaintenance }}</td>
    </tr>
    <tr>
        <td class="label">TIPO DE RECURSO:</td>
        <td>{{ $item->asset_type_name ?: '-' }}</td>
        <td class="label">N.º DE SERIE:</td>
        <td>{{ $item->serial ?: '-' }}</td>
    </tr>
    <tr>
        <td class="label">MARCA:</td>
        <td>{{ $item->brand ?: '-' }}</td>
        <td class="label">FECHA DE COMPRA:</td>
        <td>{{ $formatDate($item->datepurchase) }}</td>
    </tr>
    <tr>
        <td class="label">PROVEEDOR:</td>
        <td>-</td>
        <td class="label">MODELO:</td>
        <td>{{ $item->model ?: '-' }}</td>
    </tr>
    <tr>
        <td class="label">PROCESADOR:</td>
        <td>{{ $item->processor ?: '-' }}</td>
        <td class="label">RAM:</td>
        <td>{{ $formatRam($item->ram) }}</td>
    </tr>
    <tr>
        <td class="label">DISCO SSD:</td>
        <td>{{ $formatStorage($item->ssddisk) }}</td>
        <td class="label">DISCO HDD:</td>
        <td>{{ $formatStorage($item->hdddisk) }}</td>
    </tr>
    <tr>
        <td class="label">DESCRIPCIÓN:</td>
        <td colspan="3" class="line-area-sm">
            <div class="line-row">{{ $description !== '' ? $description : '-' }}</div>
            <div class="line-row"></div>
        </td>
    </tr>
    </table>

    <div class="section-title">DESCRIPCIÓN DE MANTENIMIENTO</div>
    <table class="grid maintenance-grid">
    <colgroup>
        <col style="width: 22%">
        <col style="width: 6%">
        <col style="width: 22%">
        <col style="width: 6%">
        <col style="width: 12%">
        <col style="width: 32%">
    </colgroup>
    <tr>
        <td class="label">PREVENTIVO:</td>
        <td class="checkbox-cell"><span class="check-box">{{ $isPreventive ? 'X' : '' }}</span></td>
        <td class="label">CORRECTIVO:</td>
        <td class="checkbox-cell"><span class="check-box">{{ $isCorrective ? 'X' : '' }}</span></td>
        <td class="label">ÁREA:</td>
        <td class="value-italic">{{ $item->agencie_name ?: '-' }}<br><span class="tiny">{{ $item->location ?: '' }}</span></td>
    </tr>
    <tr>
        <td class="label">IP:</td>
        <td colspan="2">-</td>
        <td class="label">HOSTNAME:</td>
        <td colspan="2">-</td>
    </tr>
    <tr>
        <td class="label">DIAGNÓSTICO:</td>
        <td colspan="3" class="line-area">
            @foreach($diagLines as $line)
                <div class="line-row">{{ $line }}</div>
            @endforeach
        </td>
        <td class="label center">FECHA DE MANTENIMIENTO:</td>
        <td class="value-italic">{{ $formatDate($item->date) }}</td>
    </tr>
    <tr>
        <td class="label">TRABAJO REALIZADO:</td>
        <td colspan="5" class="bullets">
            @foreach($workRows as $line)
                @if($line !== '')
                    <div class="bullet-line"><span class="bullet-prefix">•</span> {{ $line }}</div>
                @else
                    <div class="bullet-line"></div>
                @endif
            @endforeach
        </td>
    </tr>
    <tr>
        <td class="label">OBSERVACIONES:</td>
        <td colspan="5" class="bullets">
            @foreach($obsRows as $line)
                @if($line !== '')
                    <div class="bullet-line"><span class="bullet-prefix">•</span> {{ $line }}</div>
                @else
                    <div class="bullet-line"></div>
                @endif
            @endforeach
        </td>
    </tr>
    </table>

    <div class="signatures-wrap">
        <table class="signatures">
            <tr>
                <td style="width:35%;">
                    <div class="sign-line sign-line-solid">
                        RESPONSABLE DE MANTENIMIENTO
                        <div class="sign-sub">{{ $item->maintenance_user_name ?: 'UNIDAD DE SISTEMAS' }}</div>
                    </div>
                </td>
                <td style="width:30%;"></td>
                <td style="width:35%;">
                    <div class="sign-line">
                        RESPONSABLE DEL ACTIVO
                        <div class="sign-sub">{{ $item->responsible_name ?: '-' }}</div>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</div>

</body>
</html>
