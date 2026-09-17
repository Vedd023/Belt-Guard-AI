const API_BASE_URL = 'http://127.0.0.1:8000';

export interface BackendSensorPayload {
    device_id: string;
    timestamp: string;
    temperature: number;
    rpm: number;
    vibration: number;
}

export interface BackendAnalysis {
    temperature_status: string;
    rpm_status: string;
    vibration_status: string;
    risk_score: number;
    overall_status: string;
    alerts: string[];
}

export interface BackendResponse {
    sensor_data: BackendSensorPayload;
    analysis: BackendAnalysis;
}

export interface BackendLatestReading {
    id: string;
    device_id: string;
    timestamp: string;
    temperature: number;
    rpm: number;
    vibration: number;
    temperature_status: string;
    rpm_status: string;
    vibration_status: string;
    risk_score: number;
    overall_status: string;
    alerts: string[];
}

export async function sendSensorData(
    payload: BackendSensorPayload
): Promise<BackendResponse> {
    const response = await fetch(`${API_BASE_URL}/api/sensor-data`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(
            `Backend request failed: ${response.status} ${response.statusText}`
        );
    }

    return response.json();
}

export async function getLatestReading(): Promise<BackendLatestReading | null> {
    const response = await fetch(`${API_BASE_URL}/api/latest`);

    if (!response.ok) {
        throw new Error(
            `Failed to fetch latest reading: ${response.status}`
        );
    }

    const data = await response.json();

    if (data.message === 'No readings found') {
        return null;
    }

    return data;
}

export async function checkBackendHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        return response.ok;
    } catch {
        return false;
    }
}