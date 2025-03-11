<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;


class SiteController extends Controller
{
    public function list()
    {
        $sites = DB::table('sites')
            ->leftJoin('customers as c', 'c.id', '=', 'sites.customer_id')
            ->select('sites.*', 'c.customer_name')
            ->get();
        return view('monitor.sites', ['sites' => $sites]);
    }

    public function add()
    {
        $countries = [
            "Afghanistan",
            "Albania",
            "Algeria",
            "Andorra",
            "Angola",
            "Anguilla",
            "Antigua &amp; Barbuda",
            "Argentina",
            "Armenia",
            "Aruba",
            "Australia",
            "Austria",
            "Azerbaijan",
            "Bahamas",
            "Bahrain",
            "Bangladesh",
            "Barbados",
            "Belarus",
            "Belgium",
            "Belize",
            "Benin",
            "Bermuda",
            "Bhutan",
            "Bolivia",
            "Bosnia &amp; Herzegovina",
            "Botswana",
            "Brazil",
            "British Virgin Islands",
            "Brunei",
            "Bulgaria",
            "Burkina Faso",
            "Burundi",
            "Cambodia",
            "Cameroon",
            "Cape Verde",
            "Cayman Islands",
            "Chad",
            "Chile",
            "China",
            "Colombia",
            "Congo",
            "Cook Islands",
            "Costa Rica",
            "Cote D Ivoire",
            "Croatia",
            "Cruise Ship",
            "Cuba",
            "Cyprus",
            "Czech Republic",
            "Denmark",
            "Djibouti",
            "Dominica",
            "Dominican Republic",
            "Ecuador",
            "Egypt",
            "El Salvador",
            "Equatorial Guinea",
            "Estonia",
            "Ethiopia",
            "Falkland Islands",
            "Faroe Islands",
            "Fiji",
            "Finland",
            "France",
            "French Polynesia",
            "French West Indies",
            "Gabon",
            "Gambia",
            "Georgia",
            "Germany",
            "Ghana",
            "Gibraltar",
            "Greece",
            "Greenland",
            "Grenada",
            "Guam",
            "Guatemala",
            "Guernsey",
            "Guinea",
            "Guinea Bissau",
            "Guyana",
            "Haiti",
            "Honduras",
            "Hong Kong",
            "Hungary",
            "Iceland",
            "India",
            "Indonesia",
            "Iran",
            "Iraq",
            "Ireland",
            "Isle of Man",
            "Israel",
            "Italy",
            "Jamaica",
            "Japan",
            "Jersey",
            "Jordan",
            "Kazakhstan",
            "Kenya",
            "Kuwait",
            "Kyrgyz Republic",
            "Laos",
            "Latvia",
            "Lebanon",
            "Lesotho",
            "Liberia",
            "Libya",
            "Liechtenstein",
            "Lithuania",
            "Luxembourg",
            "Macau",
            "Macedonia",
            "Madagascar",
            "Malawi",
            "Malaysia",
            "Maldives",
            "Mali",
            "Malta",
            "Mauritania",
            "Mauritius",
            "Mexico",
            "Moldova",
            "Monaco",
            "Mongolia",
            "Montenegro",
            "Montserrat",
            "Morocco",
            "Mozambique",
            "Namibia",
            "Nepal",
            "Netherlands",
            "Netherlands Antilles",
            "New Caledonia",
            "New Zealand",
            "Nicaragua",
            "Niger",
            "Nigeria",
            "Norway",
            "Oman",
            "Pakistan",
            "Palestine",
            "Panama",
            "Papua New Guinea",
            "Paraguay",
            "Peru",
            "Philippines",
            "Poland",
            "Portugal",
            "Puerto Rico",
            "Qatar",
            "Reunion",
            "Romania",
            "Russia",
            "Rwanda",
            "Saint Pierre &amp; Miquelon",
            "Samoa",
            "San Marino",
            "Satellite",
            "Saudi Arabia",
            "Senegal",
            "Serbia",
            "Seychelles",
            "Sierra Leone",
            "Singapore",
            "Slovakia",
            "Slovenia",
            "South Africa",
            "South Korea",
            "Spain",
            "Sri Lanka",
            "St Kitts &amp; Nevis",
            "St Lucia",
            "St Vincent",
            "St. Lucia",
            "Sudan",
            "Suriname",
            "Swaziland",
            "Sweden",
            "Switzerland",
            "Syria",
            "Taiwan",
            "Tajikistan",
            "Tanzania",
            "Thailand",
            "Timor L'Este",
            "Togo",
            "Tonga",
            "Trinidad &amp; Tobago",
            "Tunisia",
            "Turkey",
            "Turkmenistan",
            "Turks &amp; Caicos",
            "Uganda",
            "Ukraine",
            "United Arab Emirates",
            "United Kingdom",
            "Uruguay",
            "Uzbekistan",
            "Venezuela",
            "Vietnam",
            "Virgin Islands (US)",
            "Yemen",
            "Zambia",
            "Zimbabwe"
        ];

        $customers = DB::table('customers')->get();
        return view('monitor.add-site', compact('countries', 'customers'));
    }

    public function save(Request $req)
    {

        if ($req->file('site_image')) {
            if ($req->file('site_image')->isValid())
                $site_image = $req->file('site_image')->store('public');
        } else
            $site_image = '';

        $id = DB::table('sites')->insertGetId([
            'site_name' => $req->site_name,
            'site_address_1' => $req->site_address_1,
            'site_address_2' => $req->site_address_2,
            'suburb_town_city' => $req->suburb_town_city,
            'postal_code' => $req->postal_code,
            'week_start' => $req->week_start,
            'customer_id' => $req->customer_id,
            'subscriber_id' => Auth::guard('monitor')->user()->subscriber_id,
            'monitor_id' => Auth::guard('monitor')->user()->id,
            'site_image' => $site_image,
            'site_status' => $req->site_status,
            'country' => $req->country
        ]);

        $res = ['id' => $id, 'status' => 'success'];

        return json_encode($res);
    }

    public function edit(Request $req, string $id)
    {
        $site = DB::table('sites')->where('id', '=', $id)->first();
        $countries = [
            "Afghanistan",
            "Albania",
            "Algeria",
            "Andorra",
            "Angola",
            "Anguilla",
            "Antigua &amp; Barbuda",
            "Argentina",
            "Armenia",
            "Aruba",
            "Australia",
            "Austria",
            "Azerbaijan",
            "Bahamas",
            "Bahrain",
            "Bangladesh",
            "Barbados",
            "Belarus",
            "Belgium",
            "Belize",
            "Benin",
            "Bermuda",
            "Bhutan",
            "Bolivia",
            "Bosnia &amp; Herzegovina",
            "Botswana",
            "Brazil",
            "British Virgin Islands",
            "Brunei",
            "Bulgaria",
            "Burkina Faso",
            "Burundi",
            "Cambodia",
            "Cameroon",
            "Cape Verde",
            "Cayman Islands",
            "Chad",
            "Chile",
            "China",
            "Colombia",
            "Congo",
            "Cook Islands",
            "Costa Rica",
            "Cote D Ivoire",
            "Croatia",
            "Cruise Ship",
            "Cuba",
            "Cyprus",
            "Czech Republic",
            "Denmark",
            "Djibouti",
            "Dominica",
            "Dominican Republic",
            "Ecuador",
            "Egypt",
            "El Salvador",
            "Equatorial Guinea",
            "Estonia",
            "Ethiopia",
            "Falkland Islands",
            "Faroe Islands",
            "Fiji",
            "Finland",
            "France",
            "French Polynesia",
            "French West Indies",
            "Gabon",
            "Gambia",
            "Georgia",
            "Germany",
            "Ghana",
            "Gibraltar",
            "Greece",
            "Greenland",
            "Grenada",
            "Guam",
            "Guatemala",
            "Guernsey",
            "Guinea",
            "Guinea Bissau",
            "Guyana",
            "Haiti",
            "Honduras",
            "Hong Kong",
            "Hungary",
            "Iceland",
            "India",
            "Indonesia",
            "Iran",
            "Iraq",
            "Ireland",
            "Isle of Man",
            "Israel",
            "Italy",
            "Jamaica",
            "Japan",
            "Jersey",
            "Jordan",
            "Kazakhstan",
            "Kenya",
            "Kuwait",
            "Kyrgyz Republic",
            "Laos",
            "Latvia",
            "Lebanon",
            "Lesotho",
            "Liberia",
            "Libya",
            "Liechtenstein",
            "Lithuania",
            "Luxembourg",
            "Macau",
            "Macedonia",
            "Madagascar",
            "Malawi",
            "Malaysia",
            "Maldives",
            "Mali",
            "Malta",
            "Mauritania",
            "Mauritius",
            "Mexico",
            "Moldova",
            "Monaco",
            "Mongolia",
            "Montenegro",
            "Montserrat",
            "Morocco",
            "Mozambique",
            "Namibia",
            "Nepal",
            "Netherlands",
            "Netherlands Antilles",
            "New Caledonia",
            "New Zealand",
            "Nicaragua",
            "Niger",
            "Nigeria",
            "Norway",
            "Oman",
            "Pakistan",
            "Palestine",
            "Panama",
            "Papua New Guinea",
            "Paraguay",
            "Peru",
            "Philippines",
            "Poland",
            "Portugal",
            "Puerto Rico",
            "Qatar",
            "Reunion",
            "Romania",
            "Russia",
            "Rwanda",
            "Saint Pierre &amp; Miquelon",
            "Samoa",
            "San Marino",
            "Satellite",
            "Saudi Arabia",
            "Senegal",
            "Serbia",
            "Seychelles",
            "Sierra Leone",
            "Singapore",
            "Slovakia",
            "Slovenia",
            "South Africa",
            "South Korea",
            "Spain",
            "Sri Lanka",
            "St Kitts &amp; Nevis",
            "St Lucia",
            "St Vincent",
            "St. Lucia",
            "Sudan",
            "Suriname",
            "Swaziland",
            "Sweden",
            "Switzerland",
            "Syria",
            "Taiwan",
            "Tajikistan",
            "Tanzania",
            "Thailand",
            "Timor L'Este",
            "Togo",
            "Tonga",
            "Trinidad &amp; Tobago",
            "Tunisia",
            "Turkey",
            "Turkmenistan",
            "Turks &amp; Caicos",
            "Uganda",
            "Ukraine",
            "United Arab Emirates",
            "United Kingdom",
            "Uruguay",
            "Uzbekistan",
            "Venezuela",
            "Vietnam",
            "Virgin Islands (US)",
            "Yemen",
            "Zambia",
            "Zimbabwe"
        ];

        $customers = DB::table('customers')->get();
        if ($site) {
            return view('monitor.edit-site', compact('countries', 'customers', 'site'));
        } else
            return redirect(route('sites'));
    }

    public function update(Request $req)
    {

        // $duplicate = DB::table('plans')->where('plan_name','=',$req->plan_name)->where('id','<>',$req->id)->get();

        // if(count($duplicate))
        // {            
        //     $res = ['id'=>'', 'status'=>'duplicate'];            
        // }
        // else
        // {
        // if($req->file('site_image'))
        // {
        //     if($req->file('site_image')->isValid())
        //         $site_image = $req->file('site_image')->store('public');

        //     if($req->current_image)
        //         Storage::delete($req->current_image);
        // }            
        // elseif($req->current_image)
        // {
        //     $site_image = $req->current_image; 
        // }
        // else
        // {
        $site_image = '';
        // }

        DB::table('sites')->where('id', $req->id)->update([
            'site_name' => $req->site_name,
            'site_address_1' => $req->site_address_1,
            'site_address_2' => $req->site_address_2,
            'suburb_town_city' => $req->suburb_town_city,
            'postal_code' => $req->postal_code,
            'week_start' => $req->week_start,
            'customer_id' => $req->customer_id,
            'site_image' => $site_image,
            'site_status' => $req->site_status,
            'country' => $req->country
        ]);

        $res = ['id' => $req->id, 'status' => 'success'];

        // }

        return json_encode($res);
    }

    public function delete(Request $req)
    {
        DB::table('sites')->where('id', $req->id)->delete();
        $res = ['id' => $req->id, 'status' => 'success'];
        return json_encode($res);
    }
}
