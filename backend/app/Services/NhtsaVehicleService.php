<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Log;

class NhtsaVehicleService
{
    protected string $baseUrl;
    protected int $timeout;
    protected int $retryAttempts;

    public function __construct()
    {
        $this->baseUrl = config('vehicles.nhtsa.base_url', 'https://vpic.nhtsa.dot.gov/api');
        $this->timeout = config('vehicles.nhtsa.timeout', 10);
        $this->retryAttempts = config('vehicles.nhtsa.retry_attempts', 2);
    }

    /**
     * Fetch all vehicle makes from NHTSA vPIC.
     */
    public function getAllMakes(): array
    {
        $url = "{$this->baseUrl}/vehicles/GetAllMakes?format=json";
        $response = $this->sendRequest($url);

        if (!isset($response['Results']) || !is_array($response['Results'])) {
            return [];
        }

        $makes = [];
        foreach ($response['Results'] as $item) {
            if (!empty($item['Make_ID']) && !empty($item['Make_Name'])) {
                $makes[] = [
                    'nhtsa_make_id' => (int) $item['Make_ID'],
                    'name_en' => trim($item['Make_Name']),
                ];
            }
        }

        return $makes;
    }

    /**
     * Fetch all models for a specific Make ID from NHTSA vPIC.
     */
    public function getModelsForMakeId(int $makeId): array
    {
        $url = "{$this->baseUrl}/vehicles/GetModelsForMakeId/{$makeId}?format=json";
        $response = $this->sendRequest($url);

        if (!isset($response['Results']) || !is_array($response['Results'])) {
            return [];
        }

        $models = [];
        foreach ($response['Results'] as $item) {
            if (!empty($item['Model_ID']) && !empty($item['Model_Name'])) {
                $models[] = [
                    'nhtsa_make_id' => (int) $item['Make_ID'],
                    'nhtsa_model_id' => (int) $item['Model_ID'],
                    'name_en' => trim($item['Model_Name']),
                ];
            }
        }

        return $models;
    }

    /**
     * Fetch models for Make ID and specific Year from NHTSA vPIC.
     */
    public function getModelsForMakeIdYear(int $makeId, int $year): array
    {
        $url = "{$this->baseUrl}/vehicles/GetModelsForMakeIdYear/makeId/{$makeId}/modelyear/{$year}?format=json";
        $response = $this->sendRequest($url);

        if (!isset($response['Results']) || !is_array($response['Results'])) {
            return [];
        }

        $models = [];
        foreach ($response['Results'] as $item) {
            if (!empty($item['Model_ID']) && !empty($item['Model_Name'])) {
                $models[] = [
                    'nhtsa_make_id' => (int) $item['Make_ID'],
                    'nhtsa_model_id' => (int) $item['Model_ID'],
                    'name_en' => trim($item['Model_Name']),
                    'year' => $year,
                ];
            }
        }

        return $models;
    }

    /**
     * Decode a VIN number using NHTSA DecodeVinValues endpoint.
     */
    public function decodeVin(string $vin): ?array
    {
        $cleanVin = strtoupper(trim($vin));
        $url = "{$this->baseUrl}/vehicles/DecodeVinValues/{$cleanVin}?format=json";
        $response = $this->sendRequest($url);

        if (!isset($response['Results'][0])) {
            return null;
        }

        $res = $response['Results'][0];

        // If NHTSA reported an error code
        if (!empty($res['ErrorCode']) && $res['ErrorCode'] !== '0') {
            Log::warning("NHTSA VIN decode warning for {$cleanVin}: " . ($res['ErrorText'] ?? 'Unknown error'));
        }

        return [
            'vin' => $cleanVin,
            'make' => !empty($res['Make']) ? trim($res['Make']) : null,
            'model' => !empty($res['Model']) ? trim($res['Model']) : null,
            'year' => !empty($res['ModelYear']) ? (int) $res['ModelYear'] : null,
            'trim' => !empty($res['Trim']) ? trim($res['Trim']) : null,
            'body_class' => !empty($res['BodyClass']) ? trim($res['BodyClass']) : null,
            'drive_type' => !empty($res['DriveType']) ? trim($res['DriveType']) : null,
            'engine_cylinders' => !empty($res['EngineCylinders']) ? (int) $res['EngineCylinders'] : null,
            'engine_displacement_cc' => !empty($res['DisplacementCC']) ? (int) $res['DisplacementCC'] : null,
            'engine_hp' => !empty($res['EngineHP']) ? (float) $res['EngineHP'] : null,
            'fuel_type' => !empty($res['FuelTypePrimary']) ? trim($res['FuelTypePrimary']) : null,
            'transmission_style' => !empty($res['TransmissionStyle']) ? trim($res['TransmissionStyle']) : null,
            'transmission_speeds' => !empty($res['TransmissionSpeeds']) ? trim($res['TransmissionSpeeds']) : null,
            'doors' => !empty($res['Doors']) ? (int) $res['Doors'] : null,
            'vehicle_type' => !empty($res['VehicleType']) ? trim($res['VehicleType']) : null,
            'raw' => $res,
        ];
    }

    /**
     * Safe cURL request with timeout and error handling.
     */
    protected function sendRequest(string $url): array
    {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => $this->timeout,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_HTTPHEADER => [
                'Accept: application/json',
                'User-Agent: ALA-AutoParts-Marketplace/2.6.0 (Enterprise Integration)',
            ],
            CURLOPT_SSL_VERIFYPEER => true,
        ]);

        $attempt = 0;
        $responseBody = false;

        while ($attempt < $this->retryAttempts) {
            $responseBody = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

            if ($responseBody !== false && $httpCode >= 200 && $httpCode < 300) {
                break;
            }

            $attempt++;
            if ($attempt < $this->retryAttempts) {
                usleep(300000); // 300ms backoff
            }
        }

        $error = curl_error($ch);
        curl_close($ch);

        if ($responseBody === false) {
            Log::error("NHTSA vPIC request failed for {$url}: {$error}");
            return [];
        }

        $decoded = json_decode($responseBody, true);
        return is_array($decoded) ? $decoded : [];
    }
}
