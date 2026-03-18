<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Shuchkin\SimpleXLSX;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function agenciesIndex(): Response
    {
        $agencies = DB::table('agencies')
            ->select('idagencie', 'name')
            ->orderBy('name')
            ->get();

        $agencyLocations = DB::table('agency_locations')
            ->select('idagencie', 'name')
            ->orderBy('name')
            ->get()
            ->groupBy('idagencie');

        $agencies = $agencies->map(function ($agency) use ($agencyLocations) {
            $locations = ($agencyLocations[$agency->idagencie] ?? collect())
                ->pluck('name')
                ->values()
                ->all();

            return [
                'idagencie' => $agency->idagencie,
                'name' => $agency->name,
                'locations' => $locations,
                'locations_text' => implode("\n", $locations),
            ];
        })->values();

        return Inertia::render('Settings/Agencies/List', [
            'agencies' => $agencies,
        ]);
    }

    public function agenciesStore(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:25'],
            'locations_text' => ['nullable', 'string'],
        ]);

        $locations = $this->parseLocationsText($validated['locations_text'] ?? null);

        $agencyId = DB::table('agencies')->insertGetId([
            'name' => $validated['name'],
            'localitation' => ! empty($locations) ? implode(', ', $locations) : null,
        ]);

        if (! empty($locations)) {
            DB::table('agency_locations')->insert(
                collect($locations)->map(fn ($location) => [
                    'idagencie' => $agencyId,
                    'name' => $location,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])->all()
            );
        }

        return redirect()->route('settings.agencies.list');
    }

    public function agenciesUpdate(Request $request, int $agencie): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:25'],
            'locations_text' => ['nullable', 'string'],
        ]);

        $locations = $this->parseLocationsText($validated['locations_text'] ?? null);

        DB::table('agencies')
            ->where('idagencie', $agencie)
            ->update([
                'name' => $validated['name'],
                'localitation' => ! empty($locations) ? implode(', ', $locations) : null,
            ]);

        DB::table('agency_locations')
            ->where('idagencie', $agencie)
            ->delete();

        if (! empty($locations)) {
            DB::table('agency_locations')->insert(
                collect($locations)->map(fn ($location) => [
                    'idagencie' => $agencie,
                    'name' => $location,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])->all()
            );
        }

        return redirect()->route('settings.agencies.list');
    }

    private function parseLocationsText(?string $value): array
    {
        if (! $value) {
            return [];
        }

        return collect(preg_split('/[\r\n,;]+/', $value) ?: [])
            ->map(fn ($item) => trim((string) $item))
            ->filter(fn ($item) => $item !== '')
            ->unique()
            ->map(fn ($item) => mb_substr($item, 0, 45))
            ->values()
            ->all();
    }

    public function assetTypesIndex(): Response
    {
        $assetTypes = DB::table('typefixedasset')
            ->select('idtypefixedasset', 'name', 'description', 'is_informatic')
            ->orderBy('name')
            ->get();

        return Inertia::render('Settings/AssetTypes/List', [
            'assetTypes' => $assetTypes,
        ]);
    }

    public function assetTypesStore(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'is_informatic' => ['nullable', 'boolean'],
        ]);

        DB::table('typefixedasset')->insert([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_informatic' => (bool) ($validated['is_informatic'] ?? false),
        ]);

        return redirect()->route('settings.asset-types.list');
    }

    public function assetTypesUpdate(Request $request, int $typefixedasset): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'is_informatic' => ['nullable', 'boolean'],
        ]);

        DB::table('typefixedasset')
            ->where('idtypefixedasset', $typefixedasset)
            ->update([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'is_informatic' => (bool) ($validated['is_informatic'] ?? false),
            ]);

        return redirect()->route('settings.asset-types.list');
    }

    public function importAssetsIndex(Request $request): Response
    {
        return Inertia::render('Settings/ImportAssets/Index', [
            'importResult' => $request->session()->get('import_result'),
        ]);
    }

    public function importAssetsStore(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt,xlsx', 'max:20480'],
            'mode' => ['required', 'in:preview,import'],
        ]);

        $file = $validated['file'];
        $mode = $validated['mode'];
        $currentFileSignature = $this->buildUploadedFileSignature($file);

        if ($mode === 'import') {
            $approvedSignature = (string) $request->session()->get('import_assets_preview_signature', '');

            if ($approvedSignature === '' || $approvedSignature !== $currentFileSignature) {
                return redirect()
                    ->route('settings.import-assets.index')
                    ->with('import_result', [
                        'status' => 'error',
                        'message' => 'Primero debes ejecutar "Simular importación" y luego importar ese mismo archivo.',
                        'processed' => 0,
                        'valid' => 0,
                        'inserted' => 0,
                        'created' => [
                            'agencies' => 0,
                            'locations' => 0,
                            'types' => 0,
                            'people' => 0,
                        ],
                        'errors' => [],
                        'warnings' => [],
                    ]);
            }
        }

        $result = $this->processAssetsSpreadsheetImport($file, $mode);

        if ($mode === 'preview') {
            $previewApproved = in_array((string) ($result['status'] ?? ''), ['preview-ok', 'preview-with-warnings'], true)
                && empty($result['errors'] ?? []);

            if ($previewApproved) {
                $request->session()->put('import_assets_preview_signature', $currentFileSignature);
            } else {
                $request->session()->forget('import_assets_preview_signature');
            }
        }

        if ($mode === 'import') {
            $request->session()->forget('import_assets_preview_signature');
        }

        return redirect()
            ->route('settings.import-assets.index')
            ->with('import_result', $result);
    }

    private function buildUploadedFileSignature(UploadedFile $file): string
    {
        $realPath = $file->getRealPath();
        if (! $realPath || ! is_file($realPath)) {
            return '';
        }

        $fileHash = hash_file('sha256', $realPath);
        if (! is_string($fileHash)) {
            return '';
        }

        return $fileHash;
    }

    private function processAssetsSpreadsheetImport(UploadedFile $file, string $mode): array
    {
        $sheetData = $this->readSpreadsheetRows($file);
        if (! ($sheetData['ok'] ?? false)) {
            return [
                'status' => 'error',
                'message' => $sheetData['message'] ?? 'No se pudo leer el archivo.',
                'processed' => 0,
                'valid' => 0,
                'inserted' => 0,
                'created' => [
                    'agencies' => 0,
                    'locations' => 0,
                    'types' => 0,
                    'people' => 0,
                    'networks' => 0,
                    'hardware' => 0,
                ],
                'errors' => [],
                'warnings' => [],
            ];
        }

        $headers = $sheetData['headers'];
        $rows = $sheetData['rows'];

        $requiredColumns = ['asset_code', 'agency_name', 'location', 'type_name'];
        foreach ($requiredColumns as $requiredColumn) {
            if (! in_array($requiredColumn, $headers, true)) {
                $detectedHeaders = empty($headers) ? '(ninguno)' : implode(', ', $headers);
                return [
                    'status' => 'error',
                    'message' => "Falta la columna requerida en el archivo: {$requiredColumn}. Encabezados detectados: {$detectedHeaders}.",
                    'processed' => 0,
                    'valid' => 0,
                    'inserted' => 0,
                    'created' => [
                        'agencies' => 0,
                        'locations' => 0,
                        'types' => 0,
                        'people' => 0,
                        'networks' => 0,
                        'hardware' => 0,
                    ],
                    'errors' => [],
                    'warnings' => [],
                ];
            }
        }

        $typeMap = DB::table('typefixedasset')
            ->select('idtypefixedasset', 'name', 'is_informatic')
            ->get()
            ->mapWithKeys(fn ($row) => [$this->normalizeKey((string) $row->name) => [
                'id' => (int) $row->idtypefixedasset,
                'is_informatic' => (bool) ($row->is_informatic ?? false),
            ]])
            ->all();

        $agencyMap = DB::table('agencies')
            ->select('idagencie', 'name')
            ->get()
            ->mapWithKeys(fn ($row) => [$this->normalizeKey((string) $row->name) => (int) $row->idagencie])
            ->all();

        $peopleMap = DB::table('people')
            ->select('idperson', 'name', 'employment')
            ->get()
            ->mapWithKeys(fn ($row) => [$this->normalizePersonKey((string) $row->name, (string) $row->employment) => (int) $row->idperson])
            ->all();

        $agencyLocations = DB::table('agency_locations')
            ->select('idagencie', 'name')
            ->get()
            ->groupBy('idagencie')
            ->map(function ($items) {
                return $items->mapWithKeys(fn ($item) => [$this->normalizeKey((string) $item->name) => (string) $item->name])->all();
            })
            ->all();

        $nextTypeId = -1;
        $nextAgencyId = -1;
        $nextPersonId = -1;

        $created = [
            'agencies' => 0,
            'locations' => 0,
            'types' => 0,
            'people' => 0,
            'networks' => 0,
            'hardware' => 0,
        ];

        $existingCodes = DB::table('fixedasset')
            ->whereNotNull('asset_code')
            ->pluck('asset_code')
            ->map(fn ($v) => $this->normalizeKey((string) $v))
            ->filter(fn ($v) => $v !== '')
            ->all();
        $existingCodeLookup = array_fill_keys($existingCodes, true);

        $line = 1;
        $processed = 0;
        $errors = [];
        $warnings = [];
        $rowsToInsert = [];
        $seenCodes = [];

        foreach ($rows as $row) {
            $line++;

            $processed++;

            $lineErrors = [];

            $assetCode = mb_substr((string) ($row['asset_code'] ?? ''), 0, 45);
            $agencyName = mb_substr((string) ($row['agency_name'] ?? ''), 0, 25);
            $location = mb_substr((string) ($row['location'] ?? ''), 0, 45);
            $personName = mb_substr((string) ($row['person_name'] ?? ''), 0, 45);
            $employment = mb_substr((string) ($row['employment'] ?? 'Sin cargo'), 0, 45);
            $typeName = mb_substr((string) ($row['type_name'] ?? ''), 0, 150);
            $brand = mb_substr((string) ($row['brand'] ?? ''), 0, 45);
            $model = mb_substr((string) ($row['model'] ?? ''), 0, 45);
            $description = mb_substr((string) ($row['description'] ?? ''), 0, 300);
            $serial = mb_substr((string) ($row['serial'] ?? ''), 0, 45);
            $color = mb_substr((string) ($row['color'] ?? 'Negro'), 0, 45);

            $networkUsername = mb_substr($this->normalizeTechValue((string) ($row['network_username'] ?? '')), 0, 75);
            $networkSegment = mb_substr($this->normalizeTechValue((string) ($row['network_segment'] ?? '')), 0, 45);
            $networkGateway = mb_substr($this->normalizeTechValue((string) ($row['network_gateway'] ?? '')), 0, 45);
            $networkIp = mb_substr($this->normalizeTechValue((string) ($row['network_ip'] ?? '')), 0, 45);
            $networkHostname = mb_substr($this->normalizeTechValue((string) ($row['network_hostname'] ?? '')), 0, 75);
            $operativeSystem = mb_substr($this->normalizeTechValue((string) ($row['operativesystem'] ?? '')), 0, 75);
            $antivirus = mb_substr($this->normalizeTechValue((string) ($row['antivirus'] ?? '')), 0, 75);

            $processor = mb_substr($this->normalizeTechValue((string) ($row['processor'] ?? '')), 0, 45);
            $ram = mb_substr($this->normalizeTechValue((string) ($row['ram'] ?? '')), 0, 45);
            $motherboard = mb_substr($this->normalizeTechValue((string) ($row['motherboard'] ?? '')), 0, 45);
            $graphicsCard = mb_substr($this->normalizeTechValue((string) ($row['graphicscard'] ?? '')), 0, 45);
            [$diskSsdParsed, $diskHddParsed] = $this->extractDiskValues((string) ($row['disk'] ?? ''));
            $ssdDisk = mb_substr($this->sanitizeDiskValue((string) ($row['ssddisk'] ?? $diskSsdParsed)), 0, 45);
            $hddDisk = mb_substr($this->sanitizeDiskValue((string) ($row['hdddisk'] ?? $diskHddParsed)), 0, 45);
            if ($color === '') {
                $color = 'Negro';
            }

            $datePurchase = $this->normalizeDate((string) ($row['datepurchase'] ?? '')) ?? now()->toDateString();

            if ($assetCode === '') {
                $lineErrors[] = 'asset_code es requerido.';
            }

            if ($agencyName === '') {
                $lineErrors[] = 'agency_name es requerido.';
            }

            if ($typeName === '') {
                $lineErrors[] = 'type_name es requerido.';
            }

            if ($location === '') {
                $lineErrors[] = 'location es requerido.';
            }

            $normalizedCode = $this->normalizeKey($assetCode);
            if ($normalizedCode !== '' && isset($existingCodeLookup[$normalizedCode])) {
                $lineErrors[] = 'asset_code ya existe en base de datos.';
            }

            if ($normalizedCode !== '' && isset($seenCodes[$normalizedCode])) {
                $warnings[] = [
                    'line' => $line,
                    'asset_code' => $assetCode,
                    'messages' => ['asset_code repetido dentro del archivo (se omitirá esta fila).'],
                ];

                // Duplicate code in the same file should not break import; keep first occurrence.
                continue;
            }

            if ($brand === '') {
                $brand = 'SIN MARCA';
                $warnings[] = [
                    'line' => $line,
                    'asset_code' => $assetCode,
                    'messages' => ['brand vacío: se usó valor por defecto "SIN MARCA".'],
                ];
            }

            if ($personName === '') {
                $personName = 'SIN ASIGNAR';
                $warnings[] = [
                    'line' => $line,
                    'asset_code' => $assetCode,
                    'messages' => ['person_name vacío: se usó valor por defecto "SIN ASIGNAR".'],
                ];
            }

            if (! empty($lineErrors)) {
                $errors[] = [
                    'line' => $line,
                    'asset_code' => $assetCode,
                    'messages' => $lineErrors,
                ];
                continue;
            }

            $agencyKey = $this->normalizeKey($agencyName);
            if (! isset($agencyMap[$agencyKey])) {
                if ($mode === 'import') {
                    $newAgencyId = (int) DB::table('agencies')->insertGetId([
                        'name' => $agencyName,
                        'localitation' => null,
                    ]);
                    $agencyMap[$agencyKey] = $newAgencyId;
                } else {
                    $agencyMap[$agencyKey] = $nextAgencyId;
                    $nextAgencyId--;
                }

                $created['agencies']++;
            }
            $agencyId = (int) $agencyMap[$agencyKey];

            if (! isset($agencyLocations[$agencyId])) {
                $agencyLocations[$agencyId] = [];
            }

            $locationKey = $this->normalizeKey($location);
            if (! isset($agencyLocations[$agencyId][$locationKey])) {
                if ($mode === 'import') {
                    DB::table('agency_locations')->insert([
                        'idagencie' => $agencyId,
                        'name' => $location,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                $agencyLocations[$agencyId][$locationKey] = $location;
                $created['locations']++;
            }

            $typeKey = $this->normalizeKey($typeName);
            if (! isset($typeMap[$typeKey])) {
                if ($mode === 'import') {
                    $newTypeId = (int) DB::table('typefixedasset')->insertGetId([
                        'name' => $typeName,
                        'description' => 'Importado desde Excel',
                        'is_informatic' => true,
                    ]);
                    $typeMap[$typeKey] = [
                        'id' => $newTypeId,
                        'is_informatic' => true,
                    ];
                } else {
                    $typeMap[$typeKey] = [
                        'id' => $nextTypeId,
                        'is_informatic' => true,
                    ];
                    $nextTypeId--;
                }

                $created['types']++;
            }
            $typeId = (int) ($typeMap[$typeKey]['id'] ?? 0);
            $typeIsInformatic = (bool) ($typeMap[$typeKey]['is_informatic'] ?? false);

            $personKey = $this->normalizePersonKey($personName, $employment);
            if (! isset($peopleMap[$personKey])) {
                if ($mode === 'import') {
                    $newPersonId = (int) DB::table('people')->insertGetId([
                        'name' => $personName,
                        'employment' => $employment,
                        'state' => 1,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $peopleMap[$personKey] = $newPersonId;
                } else {
                    $peopleMap[$personKey] = $nextPersonId;
                    $nextPersonId--;
                }

                $created['people']++;
            }
            $personId = (int) $peopleMap[$personKey];

            $hasTechData = $networkUsername !== ''
                || $networkSegment !== ''
                || $networkIp !== ''
                || $networkHostname !== ''
                || $processor !== ''
                || $ram !== ''
                || $motherboard !== ''
                || $graphicsCard !== ''
                || $ssdDisk !== ''
                || $hddDisk !== '';

            $hardwareId = null;
            if ($mode === 'import' && ($typeIsInformatic || $hasTechData)) {
                $networkId = (int) DB::table('networks')->insertGetId([
                    'username' => $networkUsername !== '' ? $networkUsername : '-',
                    'segment' => $networkSegment !== '' ? $networkSegment : '-',
                    'gateway' => $networkGateway !== '' ? $networkGateway : '-',
                    'ipadress' => $networkIp !== '' ? $networkIp : '-',
                    'hostname' => $networkHostname !== '' ? $networkHostname : '-',
                    'operativesystem' => $operativeSystem !== '' ? $operativeSystem : '-',
                    'antivirus' => $antivirus !== '' ? $antivirus : '-',
                ]);
                $created['networks']++;

                $hardwareId = (int) DB::table('hardware')->insertGetId([
                    'processor' => $processor !== '' ? $processor : 'N/A',
                    'ram' => $ram !== '' ? $ram : '0',
                    'motherboard' => $motherboard !== '' ? $motherboard : null,
                    'graphicscard' => $graphicsCard !== '' ? $graphicsCard : null,
                    'ssddisk' => $ssdDisk !== '' ? $ssdDisk : null,
                    'hdddisk' => $hddDisk !== '' ? $hddDisk : null,
                    'idnetwork' => $networkId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $created['hardware']++;
            }

            $seenCodes[$normalizedCode] = true;

            $rowsToInsert[] = [
                'asset_code' => $assetCode,
                'idtypefixedasset' => $typeId,
                'datepurchase' => $datePurchase,
                'brand' => $brand,
                'model' => $model !== '' ? $model : null,
                'description' => $description !== '' ? $description : null,
                'idhardware' => $hardwareId,
                'color' => $color,
                'serial' => $serial !== '' ? $serial : null,
                'idagencie' => $agencyId,
                'location' => $location,
                'idperson' => $personId,
                'state' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        if ($mode === 'preview') {
            return [
                'status' => empty($errors)
                    ? (empty($warnings) ? 'preview-ok' : 'preview-with-warnings')
                    : 'preview-with-errors',
                'message' => empty($errors)
                    ? (empty($warnings)
                        ? 'Simulación completada sin errores.'
                        : 'Simulación completada con alertas no bloqueantes.')
                    : 'Simulación completada con observaciones.',
                'processed' => $processed,
                'valid' => count($rowsToInsert),
                'inserted' => 0,
                'created' => $created,
                'errors' => $errors,
                'warnings' => $warnings,
            ];
        }

        if (! empty($errors)) {
            return [
                'status' => 'error',
                'message' => 'No se importó el archivo porque existen errores de validación.',
                'processed' => $processed,
                'valid' => count($rowsToInsert),
                'inserted' => 0,
                'created' => $created,
                'errors' => $errors,
                'warnings' => $warnings,
            ];
        }

        $insertedCount = 0;
        if (! empty($rowsToInsert)) {
            $insertedCount = (int) DB::table('fixedasset')->insertOrIgnore($rowsToInsert);

            $ignoredCount = count($rowsToInsert) - $insertedCount;
            if ($ignoredCount > 0) {
                $warnings[] = [
                    'line' => 0,
                    'asset_code' => '-',
                    'messages' => ["{$ignoredCount} registro(s) no se insertaron por duplicidad de asset_code o restricción única."],
                ];
            }
        }

        return [
            'status' => 'imported',
            'message' => empty($warnings)
                ? 'Importación completada correctamente.'
                : 'Importación completada con alertas no bloqueantes.',
            'processed' => $processed,
            'valid' => count($rowsToInsert),
            'inserted' => $insertedCount,
            'created' => $created,
            'errors' => [],
            'warnings' => $warnings,
        ];
    }

    private function readSpreadsheetRows(UploadedFile $file): array
    {
        $filePath = $file->getRealPath();
        if (! $filePath) {
            return ['ok' => false, 'message' => 'No se pudo acceder al archivo temporal de subida.'];
        }

        $extension = mb_strtolower((string) ($file->getClientOriginalExtension() ?: $file->extension()));

        if ($extension === 'xlsx') {
            $xlsx = SimpleXLSX::parse($filePath);
            if (! $xlsx) {
                return ['ok' => false, 'message' => 'No se pudo leer el archivo de Excel.'];
            }

            $sheetRows = [];
            $bestHeaderIndex = null;
            $bestScore = -1;
            $sheetCount = method_exists($xlsx, 'sheetCount') ? (int) $xlsx->sheetCount() : 1;

            for ($sheetIndex = 0; $sheetIndex < max(1, $sheetCount); $sheetIndex++) {
                $candidateRows = $xlsx->rows($sheetIndex);
                if (empty($candidateRows)) {
                    continue;
                }

                $candidateHeaderIndex = $this->detectHeaderRowIndex($candidateRows);
                if ($candidateHeaderIndex === null) {
                    continue;
                }

                $candidateScore = $this->scoreHeaderRow($candidateRows[$candidateHeaderIndex] ?? []);
                if ($candidateScore > $bestScore) {
                    $bestScore = $candidateScore;
                    $bestHeaderIndex = $candidateHeaderIndex;
                    $sheetRows = $candidateRows;
                }
            }

            if (! empty($sheetRows) && $bestHeaderIndex !== null) {
                $headerRow = $sheetRows[$bestHeaderIndex] ?? [];
                $sheetRows = array_slice($sheetRows, $bestHeaderIndex + 1);
                $normalizedHeaders = array_map(fn ($h) => $this->normalizeHeaderName((string) $h), $headerRow);

                $mappedHeaders = [];
                foreach ($normalizedHeaders as $index => $header) {
                    $mappedHeaders[$index] = $this->mapHeaderAlias($header);
                }

                $mappedHeaders = $this->applyPositionalHeaderFallback($mappedHeaders, $normalizedHeaders);

                return $this->buildMappedRowsResult($sheetRows, $mappedHeaders);
            }

            // Fallback: use first sheet and continue with generic detection below.
            $sheetRows = $xlsx->rows();
        } elseif ($extension === 'xls') {
            return ['ok' => false, 'message' => 'Formato .xls no soportado. Guarda el archivo como .xlsx e intenta nuevamente.'];
        } else {
            $handle = fopen($filePath, 'r');
            if (! $handle) {
                return ['ok' => false, 'message' => 'No se pudo abrir el archivo.'];
            }

            $sheetRows = [];
            while (($line = fgetcsv($handle, 0, ';')) !== false) {
                if (count($line) === 1 && str_contains((string) ($line[0] ?? ''), ',')) {
                    $line = str_getcsv((string) ($line[0] ?? ''), ',');
                }
                if (count($line) === 1 && str_contains((string) ($line[0] ?? ''), "\t")) {
                    $line = str_getcsv((string) ($line[0] ?? ''), "\t");
                }
                $sheetRows[] = $line;
            }
            fclose($handle);
        }

        if (empty($sheetRows)) {
            return ['ok' => false, 'message' => 'El archivo está vacío.'];
        }

        $headerIndex = $this->detectHeaderRowIndex($sheetRows);
        if ($headerIndex === null) {
            return ['ok' => false, 'message' => 'No se pudo identificar la fila de encabezados. Asegura que la primera tabla tenga títulos como AGENCIA, UBICACION, COD. ACTIVO, etc.'];
        }

        $headerRow = $sheetRows[$headerIndex] ?? [];
        $sheetRows = array_slice($sheetRows, $headerIndex + 1);
        $normalizedHeaders = array_map(fn ($h) => $this->normalizeHeaderName((string) $h), $headerRow);

        $mappedHeaders = [];
        foreach ($normalizedHeaders as $index => $header) {
            $mappedHeaders[$index] = $this->mapHeaderAlias($header);
        }

        $mappedHeaders = $this->applyPositionalHeaderFallback($mappedHeaders, $normalizedHeaders);

        return $this->buildMappedRowsResult($sheetRows, $mappedHeaders);
    }

    private function buildMappedRowsResult(array $sheetRows, array $mappedHeaders): array
    {
        $rows = [];
        foreach ($sheetRows as $sheetRow) {
            $assoc = [];
            $hasValue = false;

            foreach ($mappedHeaders as $index => $key) {
                if (! $key) {
                    continue;
                }

                $value = $sheetRow[$index] ?? '';
                if (is_float($value) || is_int($value)) {
                    if ($key === 'datepurchase' && $value > 1000) {
                        $value = Carbon::create(1899, 12, 30)->addDays((int) $value)->format('Y-m-d');
                    } else {
                        $value = (string) $value;
                    }
                }

                $value = trim((string) $value);
                $assoc[$key] = $value;
                if ($value !== '') {
                    $hasValue = true;
                }
            }

            if ($hasValue) {
                $rows[] = $assoc;
            }
        }

        $headers = array_values(array_unique(array_values(array_filter($mappedHeaders))));

        return [
            'ok' => true,
            'headers' => $headers,
            'rows' => $rows,
        ];
    }

    private function normalizeHeaderName(string $value): string
    {
        $value = trim(mb_strtolower($value));
        $value = preg_replace('/^\xEF\xBB\xBF/u', '', $value) ?? $value;
        $value = str_replace(["\u{00A0}", "\u{2007}", "\u{202F}"], ' ', $value);
        $value = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value) ?: $value;
        $value = preg_replace('/[^a-z0-9]+/', '_', $value) ?? $value;
        return trim($value, '_');
    }

    private function detectHeaderRowIndex(array $sheetRows): ?int
    {
        $maxRowsToScan = min(15, count($sheetRows));
        $bestIndex = null;
        $bestScore = 0;

        for ($i = 0; $i < $maxRowsToScan; $i++) {
            $row = $sheetRows[$i] ?? [];
            if (! is_array($row)) {
                continue;
            }

            $score = 0;
            $uniqueMapped = [];
            $nonEmptyCells = 0;

            foreach ($row as $cell) {
                $normalized = $this->normalizeHeaderName((string) $cell);
                if ($normalized === '') {
                    continue;
                }

                $nonEmptyCells++;

                $mapped = $this->mapHeaderAlias($normalized);
                if ($mapped !== null && ! isset($uniqueMapped[$mapped])) {
                    $uniqueMapped[$mapped] = true;
                    $score++;
                }

                if (
                    str_contains($normalized, 'agencia')
                    || str_contains($normalized, 'ubicacion')
                    || str_contains($normalized, 'funcionario')
                    || str_contains($normalized, 'activo')
                    || str_contains($normalized, 'marca')
                ) {
                    $score++;
                }
            }

            if ($score === 0 && $nonEmptyCells >= 8) {
                // Typical imports may have headers with unreadable encoding; keep a wide fallback.
                $score = 1;
            }

            if ($score > $bestScore) {
                $bestScore = $score;
                $bestIndex = $i;
            }
        }

        return $bestScore >= 1 ? $bestIndex : null;
    }

    private function scoreHeaderRow(array $row): int
    {
        $score = 0;
        $uniqueMapped = [];

        foreach ($row as $cell) {
            $normalized = $this->normalizeHeaderName((string) $cell);
            if ($normalized === '') {
                continue;
            }

            $mapped = $this->mapHeaderAlias($normalized);
            if ($mapped !== null && ! isset($uniqueMapped[$mapped])) {
                $uniqueMapped[$mapped] = true;
                $score += 2;
            }

            if (
                str_contains($normalized, 'agencia')
                || str_contains($normalized, 'ubicacion')
                || str_contains($normalized, 'funcionario')
                || str_contains($normalized, 'activo')
                || str_contains($normalized, 'marca')
            ) {
                $score++;
            }
        }

        return $score;
    }

    private function applyPositionalHeaderFallback(array $mappedHeaders, array $normalizedHeaders): array
    {
        $knownByPosition = [
            0 => 'agency_name',
            1 => 'location',
            2 => 'employment',
            3 => 'person_name',
            4 => 'network_username',
            5 => 'network_segment',
            6 => 'network_gateway',
            7 => 'network_ip',
            8 => 'network_hostname',
            9 => 'asset_code',
            10 => 'type_name',
            11 => 'brand',
            12 => 'model',
            13 => 'processor',
            14 => 'motherboard',
            15 => 'ram',
            16 => 'disk',
        ];

        $missingRequired = [
            'asset_code' => true,
            'agency_name' => true,
            'location' => true,
            'person_name' => true,
            'type_name' => true,
            'brand' => true,
        ];

        foreach ($mappedHeaders as $mapped) {
            if ($mapped !== null && isset($missingRequired[$mapped])) {
                unset($missingRequired[$mapped]);
            }
        }

        if (empty($missingRequired)) {
            return $mappedHeaders;
        }

        foreach ($knownByPosition as $index => $canonical) {
            if (! isset($normalizedHeaders[$index])) {
                continue;
            }

            if (($mappedHeaders[$index] ?? null) === null) {
                $mappedHeaders[$index] = $canonical;
            }
        }

        return $mappedHeaders;
    }

    private function mapHeaderAlias(string $header): ?string
    {
        $aliases = [
            'asset_code' => ['asset_code', 'cod_activo', 'codigo_activo', 'codigo_de_activo', 'cod_de_activo', 'codactivo', 'cod'],
            'agency_name' => ['agencia', 'agency'],
            'location' => ['ubicacion', 'location', 'localizacion'],
            'person_name' => ['funcionario', 'responsable', 'nombre_funcionario'],
            'employment' => ['cargo', 'employment'],
            'type_name' => ['tipo_de_activo', 'tipo_activo', 'tipo'],
            'brand' => ['marca', 'brand'],
            'model' => ['modelo', 'model'],
            'description' => ['descripcion', 'description'],
            'serial' => ['serial'],
            'datepurchase' => ['datepurchase', 'fecha_compra', 'fecha_de_compra'],
            'color' => ['color'],
            'network_username' => ['user_name', 'username', 'usuario_de_red', 'usuario_red'],
            'network_segment' => ['segmento_red', 'segmento', 'segment'],
            'network_gateway' => ['gateway'],
            'network_ip' => ['ip_address', 'direccion_ip', 'ip'],
            'network_hostname' => ['hostname', 'host'],
            'operativesystem' => ['sistema_operativo', 'operativesystem', 'sistema'],
            'antivirus' => ['antivirus'],
            'processor' => ['procesador', 'processor', 'cpu'],
            'ram' => ['ram', 'memoria_ram'],
            'motherboard' => ['tarjeta_madre', 'motherboard', 'board'],
            'graphicscard' => ['tarjeta_grafica', 'graphicscard', 'gpu'],
            'ssddisk' => ['disco_ssd', 'ssd', 'ssddisk'],
            'hdddisk' => ['disco_hdd', 'hdd', 'hdddisk'],
            'disk' => ['disco_duro', 'disco', 'disk'],
        ];

        foreach ($aliases as $canonical => $keys) {
            if (in_array($header, $keys, true)) {
                return $canonical;
            }
        }

        // Fallback for common real-world headers with punctuation/variants.
        if (
            str_contains($header, 'activo')
            && (str_contains($header, 'cod') || str_contains($header, 'codigo'))
        ) {
            return 'asset_code';
        }

        if (str_contains($header, 'agencia')) {
            return 'agency_name';
        }

        if (str_contains($header, 'ubicacion') || str_contains($header, 'localizacion')) {
            return 'location';
        }

        if (str_contains($header, 'funcionario') || str_contains($header, 'responsable')) {
            return 'person_name';
        }

        if (str_contains($header, 'cargo')) {
            return 'employment';
        }

        if (str_contains($header, 'tipo') && str_contains($header, 'activo')) {
            return 'type_name';
        }

        if (str_contains($header, 'marca')) {
            return 'brand';
        }

        if (str_contains($header, 'modelo')) {
            return 'model';
        }

        if (str_contains($header, 'serial')) {
            return 'serial';
        }

        if (str_contains($header, 'fecha') && str_contains($header, 'compra')) {
            return 'datepurchase';
        }

        if (str_contains($header, 'color')) {
            return 'color';
        }

        return null;
    }

    private function normalizeKey(string $value): string
    {
        $value = trim(mb_strtolower($value));
        $value = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value) ?: $value;
        $value = preg_replace('/\s+/', ' ', $value) ?? $value;
        return $value;
    }

    private function normalizePersonKey(string $name, string $employment): string
    {
        return $this->normalizeKey($name) . '|' . $this->normalizeKey($employment);
    }

    private function normalizeDate(string $value): ?string
    {
        $value = trim($value);
        if ($value === '') {
            return null;
        }

        $formats = ['Y-m-d', 'd/m/Y', 'd-m-Y'];

        foreach ($formats as $format) {
            try {
                $date = Carbon::createFromFormat($format, $value);
                if ($date !== false) {
                    return $date->format('Y-m-d');
                }
            } catch (\Throwable) {
                // Continue trying with other formats.
            }
        }

        return null;
    }

    private function normalizeTechValue(string $value): string
    {
        $value = trim($value);
        if ($value === '' || $value === '-' || mb_strtolower($value) === 'n/a') {
            return '';
        }

        return $value;
    }

    private function sanitizeDiskValue(string $value): string
    {
        $normalized = $this->normalizeTechValue($value);
        if ($normalized === '') {
            return '';
        }

        $withoutPrefix = preg_replace('/^\s*(ssd|hdd|hhd)\s*[:\-]?\s*/i', '', $normalized) ?? $normalized;
        $withoutPrefix = trim($withoutPrefix);

        return $withoutPrefix !== '' ? $withoutPrefix : $normalized;
    }

    private function extractDiskValues(string $disk): array
    {
        $disk = trim($disk);
        if ($disk === '') {
            return ['', ''];
        }

        $parts = preg_split('/[\r\n]+/', $disk) ?: [$disk];
        $ssd = '';
        $hdd = '';

        foreach ($parts as $part) {
            $part = trim($part);
            if ($part === '' || $part === '-') {
                continue;
            }

            $normalized = mb_strtolower($part);
            if ($ssd === '' && str_contains($normalized, 'ssd')) {
                $ssd = $this->sanitizeDiskValue($part);
                continue;
            }

            if ($hdd === '' && (str_contains($normalized, 'hdd') || str_contains($normalized, 'hhd'))) {
                $hdd = $this->sanitizeDiskValue($part);
                continue;
            }

            if ($ssd === '') {
                $ssd = $this->sanitizeDiskValue($part);
                continue;
            }

            if ($hdd === '') {
                $hdd = $this->sanitizeDiskValue($part);
            }
        }

        return [$ssd, $hdd];
    }
}
