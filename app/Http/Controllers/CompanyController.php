<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CompanyController extends Controller
{
    //
    public function fetchCompanies(Request $request)
    {
        $query = $request->query('customer_name');

        if (!$query) {
            return response()->json(['error' => 'Company name is required'], 400);
        }

        $apiKey = config('services.companies_house.api_key');
        Log::info('api key: ' . $apiKey);
        $url = "https://api.company-information.service.gov.uk/advanced-search/companies?company_name_includes=" . urlencode($query);

        try {
            $response = Http::withBasicAuth($apiKey, '')
            ->get($url);
    
            // Log the full response for debugging
            Log::error('API Response', ['status' => $response->status(), 'body' => $response->body()]);
    
            if ($response->failed()) {
                return response()->json([
                    'error' => 'Failed to fetch data',
                    'status' => $response->status(),
                    'message' => $response->body(),
                ], $response->status());
            }
    
            return response()->json($response->json());
    
        } catch (\Exception $e) {
            // Log Laravel-level errors
            Log::error('API Request Failed', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'An error occurred', 'message' => $e->getMessage()], 500);
        }

        // Make the API request
        // $response = Http::withHeaders([
        //     'Authorization' => config('services.companies_house.api_key'),
        // ])->get('https://api.company-information.service.gov.uk/advanced-search/companies', [
        //     'company_name_includes' => $query,
        //     'size' => 10, // Limit the number of results
        // ]);

        // Check if the request was successful
        // if ($response->successful()) {
        //     $companies = $response->json()['items'];
        //     return response()->json($companies);
        // }

        // // Handle errors
        // return response()->json(['error' => 'Failed to fetch companies'], 500);
    }
}
