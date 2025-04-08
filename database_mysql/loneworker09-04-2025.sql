-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 08, 2025 at 11:08 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `loneworker`
--

-- --------------------------------------------------------

--
-- Table structure for table `alerts`
--

CREATE TABLE `alerts` (
  `id` int(11) NOT NULL,
  `worker_id` int(11) NOT NULL,
  `check_in_id` int(11) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `status` enum('pending','resolved') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `alerts`
--

INSERT INTO `alerts` (`id`, `worker_id`, `check_in_id`, `type`, `status`, `created_at`, `updated_at`) VALUES
(1, 21, 3, 'missed_checkin', 'pending', '2025-03-01 07:37:37', '2025-03-01 07:37:37'),
(2, 21, 3, 'missed_checkin', 'pending', '2025-03-01 07:39:43', '2025-03-01 07:39:43'),
(3, 21, 3, 'missed_checkin', 'pending', '2025-03-01 08:17:57', '2025-03-01 08:17:57'),
(4, 21, 3, 'missed_checkin', 'pending', '2025-03-01 08:20:37', '2025-03-01 08:20:37'),
(5, 21, 3, 'missed_checkin', 'pending', '2025-03-01 09:09:27', '2025-03-01 09:09:27');

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `worker_id` int(11) DEFAULT NULL,
  `start_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `end_time` timestamp NULL DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `worker_shift_site_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `worker_id`, `start_time`, `end_time`, `status`, `worker_shift_site_id`, `created_at`, `updated_at`) VALUES
(1, 21, '2025-02-13 13:53:46', NULL, 'active', 1, '2025-02-13 13:53:46', '2025-02-13 13:53:46');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cards`
--

CREATE TABLE `cards` (
  `id` int(11) NOT NULL,
  `subscriber_id` int(11) NOT NULL,
  `card_holder_name` varchar(255) DEFAULT NULL,
  `card_number` varchar(50) DEFAULT NULL,
  `expiry_month` varchar(2) DEFAULT NULL,
  `expiry_year` varchar(4) DEFAULT NULL,
  `cvv_cvc` varchar(10) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cards`
--

INSERT INTO `cards` (`id`, `subscriber_id`, `card_holder_name`, `card_number`, `expiry_month`, `expiry_year`, `cvv_cvc`, `created_at`, `updated_at`) VALUES
(1, 1, 'Junaid', '1321414', '02', '2026', '123', '2025-03-30 17:01:32', '2025-03-30 17:02:55');

-- --------------------------------------------------------

--
-- Table structure for table `check_in_frequency`
--

CREATE TABLE `check_in_frequency` (
  `id` int(11) NOT NULL,
  `time` varchar(10) DEFAULT NULL,
  `value` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `check_in_frequency`
--

INSERT INTO `check_in_frequency` (`id`, `time`, `value`) VALUES
(1, 'No Timer', NULL),
(2, '30 mins', 1800),
(3, '60 mins', 3600),
(4, '90 mins', 5400),
(5, '2 Hours', 7200),
(6, '2.5 Hours', 9000),
(7, '3 Hours', 10800),
(8, '3.5 Hours', 12600),
(9, '4 Hours', 14400),
(10, '4.5 Hours', 16200),
(11, '5 Hours', 18000),
(12, '6 Hours', 21600);

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `customer_name` varchar(100) DEFAULT NULL,
  `phone_no` varchar(30) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role` varchar(25) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `customer_image` varchar(100) DEFAULT NULL,
  `customer_status` varchar(20) DEFAULT NULL,
  `added_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `subscriber_id` int(11) DEFAULT NULL,
  `monitor_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `customer_name`, `phone_no`, `email`, `role`, `department`, `customer_image`, `customer_status`, `added_on`, `updated_on`, `subscriber_id`, `monitor_id`) VALUES
(4, 'Nadeem', '345435435', 'nadeem@company.com', 'Head', 'Security', '', 'active', '2025-01-05 16:34:19', '2025-02-11 09:49:15', 1, NULL),
(6, 'Adnan', '1313123131212', 'adnan@company.com', 'Head', 'Security', '', 'active', '2025-01-05 17:38:07', '2025-02-07 09:52:41', 1, NULL),
(8, 'Kashan', '11111111', 'kashan@company.com', 'Head Guard', 'Security', '', 'active', '2025-01-05 18:21:10', '2025-02-07 09:52:44', 1, NULL),
(10, 'Danish Khan', '4434344345', 'danishkhan@gmail.com', 'Manager', 'Security', 'public/9QJlJxiEgRCTR8Q5SJXV46QjVL0eiCBCUUtQfgsB.jpg', 'active', '2025-01-07 19:01:24', '2025-02-07 09:52:52', 1, NULL),
(11, 'Shahrukh Ghaffar', '03456124789', 'shahrukh.ghaffar786@gmail.com', NULL, NULL, '', 'active', '2025-02-11 08:46:56', NULL, NULL, NULL),
(12, 'Shahrukh Ghaffar', '+923456124789', 'shahrukh.ghaffar786@gmail.com', 'Worker', 'Security', '', 'active', '2025-02-11 09:47:32', '2025-03-23 00:01:58', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `features`
--

CREATE TABLE `features` (
  `id` int(11) NOT NULL,
  `feature_id` varchar(40) DEFAULT NULL,
  `feature_desc` varchar(100) DEFAULT NULL,
  `added_on` timestamp NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `features`
--

INSERT INTO `features` (`id`, `feature_id`, `feature_desc`, `added_on`, `updated_on`) VALUES
(1, 'gps-location', 'GPS Location tracking', '2025-01-16 09:21:30', '2025-01-16 09:21:58'),
(2, 'sos-alarm', 'SOS alarm', '2025-01-16 09:21:30', NULL),
(3, 'mobile-safety-dashboard', 'Mobile App & Safety Dashboard', '2025-01-16 09:22:30', '2025-01-16 09:23:46'),
(4, 'incident-reporting', 'Incident reporting', '2025-01-16 09:22:30', NULL),
(5, 'check-in-reminders', 'End of Shift and Check-in reminders', '2025-01-16 09:24:39', NULL),
(6, 'out-of-hours-alerts', 'Out of hours alerts', '2025-01-16 09:24:39', NULL),
(7, 'auto-alarm-escalation', 'Automated alarm escalation ', '2025-01-16 09:24:55', NULL),
(8, '24-7-monitoring', '24/7 Live Monitoring with emergency response', '2025-01-16 09:26:03', NULL),
(9, 'safety-monitoring', 'Professional Safety Monitoring Centre handling all alarms', '2025-01-16 09:26:03', NULL),
(10, 'precise-location', 'Nationwide emergency service dispatch to your precise location', '2025-01-16 09:26:55', NULL),
(11, 'api-integration', 'API Integration', '2025-01-16 09:27:21', NULL),
(12, 'satellite-devies', 'Satellite devices', '2025-01-16 09:27:21', NULL),
(13, 'enhances-gps', 'Enhanced GPS', '2025-01-16 09:27:53', NULL),
(14, 'scheduled-reports', 'Scheduled Reports', '2025-01-16 09:27:53', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lwadmin`
--

CREATE TABLE `lwadmin` (
  `id` int(11) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `role` varchar(10) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(30) NOT NULL,
  `cell_no` varchar(50) DEFAULT NULL,
  `phone_no` varchar(50) DEFAULT NULL,
  `company_name` varchar(100) DEFAULT NULL,
  `official_address` varchar(150) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `user_image` varchar(100) DEFAULT NULL,
  `user_type` varchar(10) DEFAULT NULL,
  `added_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lwadmin`
--

INSERT INTO `lwadmin` (`id`, `username`, `role`, `email`, `password`, `cell_no`, `phone_no`, `company_name`, `official_address`, `designation`, `user_image`, `user_type`, `added_on`, `updated_on`) VALUES
(1, 'admin', 'admin', 'admin@loneworker.com', 'admin@loneworker.com', '+441234567890', '+441234567890', NULL, NULL, 'Admin', 'default.png', 'admin', '2025-01-24 13:22:23', '2025-03-28 19:31:09');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2025_01_29_103649_create_personal_access_tokens_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `description` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `notification_read` tinyint(1) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`email`, `token`, `created_at`) VALUES
('shahrukh.ghaffar786@gmail.com', '$2y$12$9n6WDCnD57huYO6.FhIKoeurl4aFg4rGnYU3dDbhidxpopi/y0FYy', '2025-02-01 04:58:30');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(17, 'App\\Models\\Worker', 2, 'worker-access', '7bdbd8ac6dc1d693cb088bfd567160fc0256b323da355e65bce71a94e4a60755', '[\"*\"]', NULL, NULL, '2025-01-31 06:17:06', '2025-01-31 06:17:06'),
(18, 'App\\Models\\Worker', 2, 'worker-access', '927e4950d787781a224ce1576421f9437170de165650e246bb95ac9d7e30c9b4', '[\"*\"]', NULL, NULL, '2025-01-31 06:19:36', '2025-01-31 06:19:36'),
(19, 'App\\Models\\Worker', 2, 'worker-access', 'cd2395f4e7d1d172e3cb72f63b7c15184d5d1604da329be2f1546e728918778f', '[\"*\"]', '2025-01-31 06:44:34', NULL, '2025-01-31 06:20:03', '2025-01-31 06:44:34'),
(20, 'App\\Models\\Worker', 2, 'worker-access', '50903940779b5f8729a05177cd3abf7efcc947faff39db43a9d1e7b748b9f7d2', '[\"*\"]', '2025-01-31 07:15:14', NULL, '2025-01-31 07:14:03', '2025-01-31 07:15:14');

-- --------------------------------------------------------

--
-- Table structure for table `plans`
--

CREATE TABLE `plans` (
  `id` int(11) NOT NULL,
  `plan_name` varchar(50) DEFAULT NULL,
  `plan_description` varchar(500) DEFAULT NULL,
  `plan_type` varchar(10) DEFAULT NULL,
  `monthly_price` varchar(8) DEFAULT NULL,
  `yearly_price` varchar(8) DEFAULT NULL,
  `duration` varchar(6) DEFAULT NULL,
  `persons` int(11) DEFAULT NULL,
  `plan_status` varchar(20) DEFAULT NULL,
  `plan_image` varchar(100) DEFAULT NULL,
  `added_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `plans`
--

INSERT INTO `plans` (`id`, `plan_name`, `plan_description`, `plan_type`, `monthly_price`, `yearly_price`, `duration`, `persons`, `plan_status`, `plan_image`, `added_on`, `updated_on`) VALUES
(1, 'Basic Plan', '<p>Basic Plan</p><p><br></p>', 'paid', '50', '1500', 'yearly', 100, 'published', 'public/7DcpBtfSBd1tqAScZo3mMT1yJHj4fGQIxoRjCv1h.png', '2025-01-03 21:39:35', '2025-01-07 18:46:54'),
(2, 'Economy Plan', '', 'paid', '80', '700', NULL, NULL, NULL, NULL, '2025-01-03 21:45:10', '2025-01-06 14:00:13'),
(3, 'Free', '', 'free', '0', '0', NULL, NULL, NULL, NULL, '2025-01-03 21:45:24', NULL),
(13, 'Diamond Plan', '<p><br></p><p><br></p>', 'select', NULL, NULL, 'select', NULL, 'published', '', '2025-01-07 17:51:23', NULL),
(14, 'Bronze Plan', '<p>Bronze Plan</p><p><br></p>', 'paid', '100', '200', 'yearly', 100, 'published', '', '2025-01-07 17:59:57', '2025-01-07 18:30:12'),
(15, 'Bronze Plan 1', '<p><br></p><p>Bronze Plan 1</p><p><br></p>', 'paid', '100', '1000', 'yearly', 100, 'published', 'public/aEvnmv5wTmvjuCzQNSsoK9l3xqvJFkhI204wKUEP.png', '2025-01-07 18:25:43', '2025-01-07 18:31:54'),
(16, 'Diamond Plan 1', '<p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p>', 'paid', NULL, NULL, 'yearly', NULL, 'published', '', '2025-01-16 11:03:07', '2025-01-16 13:48:38'),
(17, 'Test Plan', '<p><br></p><p><br></p>', 'paid', '1000', '2000', 'yearly', 100, 'published', '', '2025-01-16 12:44:49', NULL),
(18, 'Test Plan 10', '<p>N/A</p><p><br></p><p><br></p>', 'free', '10', '120', 'yearly', 100, 'published', '', '2025-01-24 14:16:18', '2025-01-24 14:16:40');

-- --------------------------------------------------------

--
-- Table structure for table `plan_features`
--

CREATE TABLE `plan_features` (
  `id` int(11) NOT NULL,
  `plan_id` int(11) DEFAULT NULL,
  `feature_id` varchar(40) DEFAULT NULL,
  `added_on` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `plan_features`
--

INSERT INTO `plan_features` (`id`, `plan_id`, `feature_id`, `added_on`) VALUES
(24, 16, 'gps-location', '2025-01-16 13:48:38'),
(25, 16, '24-7-monitoring', '2025-01-16 13:48:38'),
(28, 18, 'gps-location', '2025-01-24 14:16:40'),
(29, 18, 'mobile-safety-dashboard', '2025-01-24 14:16:40');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shifts`
--

CREATE TABLE `shifts` (
  `id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `default_start_time` varchar(20) DEFAULT NULL,
  `default_end_time` varchar(20) DEFAULT NULL,
  `status` varchar(255) NOT NULL,
  `added_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `subscriber_id` int(11) DEFAULT NULL,
  `monitor_id` int(11) NOT NULL,
  `days` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`days`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shifts`
--

INSERT INTO `shifts` (`id`, `site_id`, `name`, `default_start_time`, `default_end_time`, `status`, `added_on`, `updated_on`, `subscriber_id`, `monitor_id`, `days`) VALUES
(1, 1, 'Test Shift 2', '12:00 AM', '8:00 AM', 'inactive', '2025-01-25 07:39:28', '2025-02-25 12:28:56', 1, 4, '[\"monday\",\"tuesday\",\"saturday\"]'),
(2, 1, 'Test Shift 1', '9:00 AM', '5:00 PM', 'active', '2025-01-25 06:48:35', '2025-02-24 13:22:00', 1, 4, NULL),
(3, 2, 'Test Shift 5', '10:00 AM', '6:00 PM', 'active', '2025-02-08 06:27:02', '2025-02-24 13:22:26', NULL, 4, NULL),
(4, 3, 'Test Shift 3', '12:00 AM', '6:30 AM', 'active', '2025-02-25 11:56:57', '2025-02-25 11:56:57', NULL, 4, '[\"monday\",\"tuesday\",\"wednesday\"]'),
(5, 2, 'Test Shift 6', '12:00 AM', '12:00 AM', 'active', '2025-03-20 15:20:55', '2025-03-20 15:20:55', NULL, 4, '[\"monday\"]');

-- --------------------------------------------------------

--
-- Table structure for table `sites`
--

CREATE TABLE `sites` (
  `id` int(11) NOT NULL,
  `site_name` varchar(100) DEFAULT NULL,
  `site_address_1` varchar(200) DEFAULT NULL,
  `site_address_2` varchar(255) DEFAULT NULL,
  `site_status` varchar(10) DEFAULT NULL,
  `site_image` varchar(100) DEFAULT NULL,
  `added_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `subscriber_id` int(11) DEFAULT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `week_start` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `suburb_town_city` varchar(255) DEFAULT NULL,
  `postal_code` varchar(255) DEFAULT NULL,
  `monitor_id` int(11) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `site_manager_name` varchar(255) DEFAULT NULL,
  `site_manager_contact` varchar(20) DEFAULT NULL,
  `national_emergency_number` varchar(20) DEFAULT NULL,
  `local_police_contact` varchar(20) DEFAULT NULL,
  `local_firebrigade_contact` varchar(20) DEFAULT NULL,
  `local_hospital_contact` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sites`
--

INSERT INTO `sites` (`id`, `site_name`, `site_address_1`, `site_address_2`, `site_status`, `site_image`, `added_on`, `updated_on`, `subscriber_id`, `customer_id`, `week_start`, `country`, `suburb_town_city`, `postal_code`, `monitor_id`, `longitude`, `latitude`, `site_manager_name`, `site_manager_contact`, `national_emergency_number`, `local_police_contact`, `local_firebrigade_contact`, `local_hospital_contact`) VALUES
(1, 'Tess Site', 'Test Address', NULL, 'active', NULL, '2025-01-05 19:13:41', '2025-02-08 13:02:04', 1, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'Al Faiz Group', 'test', NULL, 'active', '', '2025-01-05 19:26:35', '2025-02-08 13:02:00', 1, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'Test site 1', 'Test site 1', NULL, 'inactive', '', '2025-01-05 19:26:57', '2025-02-08 13:01:04', 1, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 'Test Site abc', '12 apt, abc street', '12 apt, abc street', 'active', '', '2025-02-08 12:40:23', '2025-02-24 11:17:06', 1, 6, 'Monday', NULL, 'Karachi', '75290', 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 'Test Site 1', '12 apt, abc street', '12 apt, abc street', 'active', '', '2025-03-19 18:50:50', '2025-03-22 23:40:59', 1, 4, 'Tuesday', 'Austria', 'Karachi', '75290', 4, -180.12340000, -80.12340000, 'Ali', '+923145123456', '03145123456', '03145123456', '03145123456', '03145123456');

-- --------------------------------------------------------

--
-- Table structure for table `subscribers`
--

CREATE TABLE `subscribers` (
  `id` int(11) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `role` varchar(10) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(30) DEFAULT NULL,
  `cell_no` varchar(50) DEFAULT NULL,
  `phone_no` varchar(50) DEFAULT NULL,
  `company_name` varchar(100) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `user_image` varchar(100) DEFAULT NULL,
  `user_type` varchar(10) DEFAULT NULL,
  `added_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `plan_id` int(11) DEFAULT NULL,
  `company_number` varchar(255) NOT NULL,
  `address_line_1` varchar(255) NOT NULL,
  `address_line_2` varchar(255) NOT NULL,
  `country` varchar(255) NOT NULL,
  `locality` varchar(255) NOT NULL,
  `region` varchar(255) NOT NULL,
  `postal_code` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscribers`
--

INSERT INTO `subscribers` (`id`, `username`, `role`, `email`, `password`, `cell_no`, `phone_no`, `company_name`, `designation`, `user_image`, `user_type`, `added_on`, `updated_on`, `plan_id`, `company_number`, `address_line_1`, `address_line_2`, `country`, `locality`, `region`, `postal_code`) VALUES
(1, 'Junaid', 'monitor', 'junaidfaraz79@gmail.com', 'junaidfaraz79@gmail.com', '+441234567890', '+441234567890', 'Dummy Company', 'Employee', 'default_image.jpg', 'subscriber', '2025-02-04 11:49:05', '2025-02-04 11:49:05', 17, '1234', '12 apt, abc street', '12 apt, abc street', 'Pakistan', 'Locality', 'Region', '75290'),
(2, 'Test User', 'monitor', 'testuser@gmail.com', 'testuser@gmail.com', '020 7123 4587', '+44 117 2345678', 'Example Company', 'Manager', 'default_image.jpg', 'subscriber', '2025-02-04 11:49:05', '2025-02-04 11:49:05', 21, '', '', '', '', '', '', ''),
(3, 'Shahrukh Ghaffar', 'subscriber', 'subscriber@gmail.com', 'subscriber123.', '123-456-7890', '333-305-4572', 'Dummy Company', 'Employee', 'default_image.jpg', 'subscriber', '2025-03-22 20:11:21', '2025-03-22 20:11:21', 17, '11783806', '12 apt, abc street', '134 Edmund Street', 'Pakistan', 'Birmingham', 'London', 'B3 2ES');

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` int(11) NOT NULL,
  `user_email` varchar(100) DEFAULT NULL,
  `plan_name` varchar(50) DEFAULT NULL,
  `plan_description` varchar(500) DEFAULT NULL,
  `plan_type` varchar(10) DEFAULT NULL,
  `monthly_price` varchar(8) DEFAULT NULL,
  `yearly_price` varchar(8) DEFAULT NULL,
  `duration` varchar(6) DEFAULT NULL,
  `persons` int(11) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `added_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `user_email`, `plan_name`, `plan_description`, `plan_type`, `monthly_price`, `yearly_price`, `duration`, `persons`, `status`, `added_on`, `updated_on`) VALUES
(17, 'junaidfaraz79@gmail.com', 'Test Plan', '<p><br></p><p><br></p>', 'paid', '1000', '2000', 'yearly', 100, 'inactive', '2025-01-16 12:44:49', '2025-01-18 15:10:45'),
(21, 'testuser@gmail.com', 'Basic Plan', '<p>Basic Plan</p><p><br></p>', 'paid', '50', '1500', 'yearly', 100, 'active', '2025-01-18 13:01:32', '2025-02-04 11:48:57'),
(22, 'adnan79@gmail.com', 'Free', '', 'free', '0', '0', NULL, NULL, 'active', '2025-01-18 14:48:21', NULL),
(23, 'danishkhan7911@gmail.com', 'Economy Plan', '', 'paid', '80', '700', NULL, NULL, 'active', '2025-01-18 15:23:50', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `timings`
--

CREATE TABLE `timings` (
  `id` int(11) NOT NULL,
  `time` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `timings`
--

INSERT INTO `timings` (`id`, `time`) VALUES
(1, '12:00 AM'),
(2, '12:15 AM'),
(3, '12:30 AM'),
(4, '12:45 AM'),
(5, '1:00 AM'),
(6, '1:15 AM'),
(7, '1:30 AM'),
(8, '1:45 AM'),
(9, '2:00 AM'),
(10, '2:15 AM'),
(11, '2:30 AM'),
(12, '2:45 AM'),
(13, '3:00 AM'),
(14, '3:15 AM'),
(15, '3:30 AM'),
(16, '3:45 AM'),
(17, '4:00 AM'),
(18, '4:15 AM'),
(19, '4:30 AM'),
(20, '4:45 AM'),
(21, '5:00 AM'),
(22, '5:15 AM'),
(23, '5:30 AM'),
(24, '5:45 AM'),
(25, '6:00 AM'),
(26, '6:15 AM'),
(27, '6:30 AM'),
(28, '6:45 AM'),
(29, '7:00 AM'),
(30, '7:15 AM'),
(31, '7:30 AM'),
(32, '7:45 AM'),
(33, '8:00 AM'),
(34, '8:15 AM'),
(35, '8:30 AM'),
(36, '8:45 AM'),
(37, '9:00 AM'),
(38, '9:15 AM'),
(39, '9:30 AM'),
(40, '9:45 AM'),
(41, '10:00 AM'),
(42, '10:15 AM'),
(43, '10:30 AM'),
(44, '10:45 AM'),
(45, '11:00 AM'),
(46, '11:15 AM'),
(47, '11:30 AM'),
(48, '11:45 AM'),
(49, '12:00 PM'),
(50, '12:15 PM'),
(51, '12:30 PM'),
(52, '12:45 PM'),
(53, '1:00 PM'),
(54, '1:15 PM'),
(55, '1:30 PM'),
(56, '1:45 PM'),
(57, '2:00 PM'),
(58, '2:15 PM'),
(59, '2:30 PM'),
(60, '2:45 PM'),
(61, '3:00 PM'),
(62, '3:15 PM'),
(63, '3:30 PM'),
(64, '3:45 PM'),
(65, '4:00 PM'),
(66, '4:15 PM'),
(67, '4:30 PM'),
(68, '4:45 PM'),
(69, '5:00 PM'),
(70, '5:15 PM'),
(71, '5:30 PM'),
(72, '5:45 PM'),
(73, '6:00 PM'),
(74, '6:15 PM'),
(75, '6:30 PM'),
(76, '6:45 PM'),
(77, '7:00 PM'),
(78, '7:15 PM'),
(79, '7:30 PM'),
(80, '7:45 PM'),
(81, '8:00 PM'),
(82, '8:15 PM'),
(83, '8:30 PM'),
(84, '8:45 PM'),
(85, '9:00 PM'),
(86, '9:15 PM'),
(87, '9:30 PM'),
(88, '9:45 PM'),
(89, '10:00 PM'),
(90, '10:15 PM'),
(91, '10:30 PM'),
(92, '10:45 PM'),
(93, '11:00 PM'),
(94, '11:15 PM'),
(95, '11:30 PM'),
(96, '11:45 PM');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `subscriber_id` int(11) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `role` varchar(10) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(30) DEFAULT NULL,
  `cell_no` varchar(50) DEFAULT NULL,
  `phone_no` varchar(50) DEFAULT NULL,
  `company_name` varchar(100) DEFAULT NULL,
  `official_address` varchar(150) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `user_image` varchar(100) DEFAULT NULL,
  `user_type` varchar(10) DEFAULT 'monitor',
  `added_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `home_address` varchar(255) DEFAULT NULL,
  `gender` varchar(25) DEFAULT NULL,
  `emergency_contact_1` varchar(20) DEFAULT NULL,
  `emergency_contact_2` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `subscriber_id`, `username`, `role`, `email`, `password`, `cell_no`, `phone_no`, `company_name`, `official_address`, `designation`, `user_image`, `user_type`, `added_on`, `updated_on`, `home_address`, `gender`, `emergency_contact_1`, `emergency_contact_2`) VALUES
(2, 1, 'Junaid', 'monitor', 'junaidfaraz79@gmail.com', 'junaidfaraz79@gmail.com', NULL, NULL, NULL, NULL, NULL, '', 'subscriber', '2025-01-03 20:22:31', '2025-02-07 09:22:54', NULL, NULL, NULL, NULL),
(3, 1, 'Test User', 'monitor', 'bismaimran3@gmail.com', 'monitor', '020 7123 4567', '+44 117 2345678', '', '', '', NULL, 'subscriber', '2025-01-07 17:41:58', '2025-03-23 12:33:20', NULL, NULL, NULL, NULL),
(4, 1, 'Monitor', 'monitor', 'monitor@gmail.com', 'monitor', NULL, '534534543', 'Test Company', 'Test address', 'Manager', '', 'monitor', '2025-01-18 12:01:06', '2025-02-08 12:07:55', NULL, NULL, NULL, NULL),
(18, 1, 'Kashif', 'monitor', 'kashifkhan@gmail.com', 'password', '535435353', '353535', 'Test Company', 'Test address', 'Manager', NULL, 'monitor', '2025-01-18 13:01:32', '2025-02-07 13:42:35', NULL, NULL, NULL, NULL),
(19, 1, 'Adnan', 'monitor', 'adnan79@gmail.com', 'password', '343322', '3424234', 'Test Company', 'Test address', 'Manager', NULL, 'monitor', '2025-01-18 14:48:21', '2025-02-07 13:42:39', NULL, NULL, NULL, NULL),
(20, 2, 'Danish Khan', 'monitor', 'danishkhan7911@gmail.com', 'password', '3423423', '4434344345', 'Test Company', 'Test address', 'Manager', NULL, 'monitor', '2025-01-18 15:23:50', '2025-02-07 13:57:59', NULL, NULL, NULL, NULL),
(21, 1, 'test monitor', 'monitor', 'testmonitor@gmail.com', 'monitor', '0314-5213456', '0314-5213456', 'esolacetech', '12 apt, abc street', 'monitor', 'public/Otug7U3mOAFMD5J2vXojJz2hvIN4dDYq0mJfyadg.png', 'monitor', '2025-02-10 08:45:43', '2025-02-11 08:47:13', NULL, NULL, NULL, NULL),
(22, 1, 'test monitor', 'monitor', 'shahrukh.ghaffar786@gmail.com', 'monitor', '0314-5213456', '03456124789', 'esolacetech', '12 apt, abc street', 'Designation', NULL, 'monitor', '2025-02-22 14:07:25', '2025-02-22 14:07:25', NULL, NULL, NULL, NULL),
(26, 1, 'admin', 'monitor', 'shahrukh.ghaffar@gmail.com', 'monitor', '0314-5213456', '3456124781', 'esolacetech', '12 apt, abc street', 'Professor', NULL, 'monitor', '2025-03-18 18:51:47', NULL, NULL, NULL, NULL, NULL),
(27, 1, 'admin', 'monitor', 'shahrukh.ghaffar1@gmail.com', 'monitor', '0314-5213456', '3456124782', 'esolacetech', '12 apt, abc street', 'Professor', NULL, 'monitor', '2025-03-18 18:52:42', NULL, NULL, NULL, NULL, NULL),
(28, 1, 'admin', 'monitor', 'shahrukh.ghaffar5@gmail.com', 'monitor', '0314-5213456', '+923456124782', 'esolacetech', '12 apt, abc street', 'Professor', NULL, 'monitor', '2025-03-18 18:53:27', NULL, NULL, NULL, NULL, NULL),
(29, 1, 'admin', 'monitor', 'shahrukh.ghaffar2@gmail.com', 'monitor', '0314-5213459', '3456124789', 'esolacetech', '12 apt, abc street', 'Professor', NULL, 'monitor', '2025-03-19 17:14:18', NULL, NULL, NULL, NULL, NULL),
(30, 1, 'admin', 'monitor', 'shahrukh.ghaffar3@gmail.com', 'monitor', '0314-5213456', '3456125789', 'esolacetech', '12 apt, abc street', 'Professor', NULL, 'monitor', '2025-03-19 17:20:49', NULL, NULL, NULL, NULL, NULL),
(31, 1, 'admin', 'monitor', 'shahrukh.ghaffar7@gmail.com', 'monitor', '+923451234458', '+441234567891', 'esolacetech', '12 apt, abc street', 'Professor', NULL, 'monitor', '2025-03-19 17:29:45', '2025-03-22 23:19:41', '13apt, abc street', 'female', '+923467364499', '+441234567890'),
(34, 1, 'admin', 'monitor', 'bismaimran36@gmail.com', 'bisma@786', '+923456124789', '+923456124789', 'esolacetech', '12 apt, abc street', 'Lecturer', NULL, 'monitor', '2025-03-23 12:36:12', '2025-03-23 14:19:16', '13apt, abc street', 'female', '+923456124789', '+923456124789');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `subscriber_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `workers`
--

CREATE TABLE `workers` (
  `id` int(11) NOT NULL,
  `subscriber_id` int(11) DEFAULT NULL,
  `worker_name` varchar(100) DEFAULT NULL,
  `phone_no` varchar(30) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `pin` varchar(6) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone_type` varchar(5) DEFAULT NULL,
  `role` varchar(25) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `check_in_frequency` varchar(20) DEFAULT NULL,
  `worker_image` varchar(100) DEFAULT NULL,
  `worker_status` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `sia_license_number` varchar(255) DEFAULT NULL,
  `sia_license_expiry_date` date DEFAULT NULL,
  `emergency_contact_1` varchar(20) DEFAULT NULL,
  `emergency_contact_2` varchar(20) DEFAULT NULL,
  `nok_name` varchar(255) DEFAULT NULL,
  `nok_relation` varchar(255) DEFAULT NULL,
  `nok_address` text DEFAULT NULL,
  `nok_contact` varchar(20) DEFAULT NULL,
  `monitor_id` int(11) DEFAULT NULL,
  `check_in_visibility` varchar(45) NOT NULL DEFAULT '7days'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `workers`
--

INSERT INTO `workers` (`id`, `subscriber_id`, `worker_name`, `phone_no`, `email`, `pin`, `password`, `phone_type`, `role`, `department`, `check_in_frequency`, `worker_image`, `worker_status`, `created_at`, `updated_at`, `deleted_at`, `sia_license_number`, `sia_license_expiry_date`, `emergency_contact_1`, `emergency_contact_2`, `nok_name`, `nok_relation`, `nok_address`, `nok_contact`, `monitor_id`, `check_in_visibility`) VALUES
(2, 1, 'Kashiff', '0325-5454554', 'junaidfaraz79@gmail.com', '123456', 'junaid@123', 'old', NULL, NULL, NULL, '', 'active', '2025-01-03 20:22:31', '2025-02-27 14:18:18', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '7days'),
(4, 1, 'Nadeem', '345435435', 'admin@marketdata.icu', '789101', '', NULL, 'Head', 'Security', '60 mins', '', 'active', '2025-01-05 16:34:19', '2025-02-13 18:22:54', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '7days'),
(5, 1, 'Jamal', '1313123131212', 'junaidfaraz79@gmail.com', '123451', '', NULL, 'Head', 'Security', '60 mins', '', 'active', '2025-01-05 17:33:01', '2025-03-28 19:55:46', '2025-03-28 19:55:46', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '7days'),
(6, 1, 'Test Worker', '1313123131212', 'admin@marketdata.icu', '123452', '', 'smart', 'Head', 'Security', '60 mins', '', 'active', '2025-01-05 17:38:07', '2025-03-28 20:17:44', '2025-03-28 20:17:44', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '7days'),
(7, 1, 'Jamshed Qureshi', '1111111', 'junaidfaraz79@gmail.com', '123453', '', 'old', 'Head Guard', 'Security', 'No Timer', '', 'active', '2025-01-05 18:06:19', '2025-02-13 18:23:10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '7days'),
(8, 1, 'New Worker', '11111111', 'admin@marketdata.icu', '123454', '', 'old', 'Head Guard', 'Security', 'No Timer', '', 'active', '2025-01-05 18:21:10', '2025-02-13 18:23:15', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '7days'),
(9, 1, 'Salman Qureshi', '4434344345', 'salmanqureshi@gmail.com', '123455', '', NULL, 'Head Guard', 'Security', '90 mins', '', 'active', '2025-01-06 15:24:38', '2025-02-13 18:23:21', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '7days'),
(10, 1, 'Salman Qureshi', '4434344345', 'abc@abc.com', '123457', '', 'smart', 'Head Guard', 'Security', '2 Hours', '', 'active', '2025-01-07 18:56:28', '2025-02-13 18:23:25', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '7days'),
(20, 1, 'Bisma Imran', '21343435', 'bisma@gmail.com', '123458', '', 'old', 'Worker', 'Security', 'No Timer', '', 'active', '2025-01-23 13:20:00', '2025-02-13 18:23:30', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4, '7days'),
(21, 1, 'Example Worker 1', '03456124789', 'shahrukh@gmail.com', '123459', NULL, 'old', 'Worker', 'Security', '2', '', 'active', '2025-01-31 08:58:05', '2025-02-27 14:34:32', NULL, '123456788998', '2030-01-31', '03426548833', '03426548833', 'Ali', 'brother', '12 apt, abc street', '03426548833', 4, '7days'),
(22, 1, 'New Test Worker', '03456124789', 'newtestworker@gmail.com', '', NULL, 'old', 'Worker', 'Security', '2', 'worker_images/1740152079_aline-photo.png', 'active', '2025-02-21 15:34:41', NULL, NULL, '123456788998', '2025-02-11', '03426548833', '03426548833', 'Shahrukh Ghaffar', 'brother', '12 apt, abc street', '03164151345', 4, '30days'),
(23, 1, 'Example Worker 2', '+923456124789', 'exampleworker2@gmail.com', '', NULL, 'old', 'Worker', 'Security', '3', '', 'active', '2025-02-21 15:36:06', '2025-03-23 14:50:50', NULL, '123456788998', '2026-03-12', '+923426548833', '+923164151345', 'Shahrukh Ghaffar', 'brother', '12 apt, abc street', '+923164151345', 4, 'today'),
(24, 1, 'Bisma Imran', '03456124789', 'shahrukh@gmail.com', '', NULL, 'smart', 'Worker', 'Security', '2', '', 'active', '2025-02-22 14:08:55', '2025-02-27 14:34:36', NULL, '123456788998', '2027-03-05', '03426548833', '03164151345', 'Shahrukh Ghaffar', 'brother', '12 apt, abc street', '03164151345', 22, '7days'),
(27, 1, 'Example Worker', '03456124789', 'shahrukh@gmail.com', '', NULL, 'smart', 'Worker', 'Security', '3', 'worker_images/1740408987_aline-photo.png', 'active', '2025-02-24 14:56:27', '2025-02-27 14:34:41', NULL, '123456788998', '2027-02-25', '03426548833', '03164151345', 'Shahrukh Ghaffar', 'brother', '12 apt, abc street', '03164151345', 4, '7days'),
(28, 1, 'Bisma Imran', '03456124789', 'shahrukh.ghaffar786@gmail.com', '', NULL, 'old', 'Worker', 'Security', '2', 'worker_images/1740667308_aline-photo.png', 'active', '2025-02-27 14:41:48', '2025-02-27 14:41:48', NULL, '123456788998', '2027-02-11', '03426548833', '03426548833', 'Shahrukh Ghaffar', 'brother', '12 apt, abc street', '03164151345', 4, '7days'),
(29, 1, 'Bisma Imran', '+923456124789', 'shahrukh.ghaffar5@gmail.com', '052196', 'shahrukh.ghaffar5@gmail.com', 'smart', 'Worker', 'Security', '2', '', 'active', '2025-03-20 15:05:06', '2025-03-22 23:32:15', NULL, '123456788998', '2025-03-12', '+923426548833', '+923164151345', 'Shahrukh Ghaffar', 'brother', '12 apt, abc street', '+923164151345', 4, '30days');

-- --------------------------------------------------------

--
-- Table structure for table `worker_check_ins`
--

CREATE TABLE `worker_check_ins` (
  `id` int(11) NOT NULL,
  `attendance_id` int(11) NOT NULL,
  `worker_id` int(11) NOT NULL,
  `scheduled_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `actual_time` timestamp NULL DEFAULT NULL,
  `grace_period_end` datetime DEFAULT NULL,
  `status` varchar(10) NOT NULL,
  `location` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `worker_check_ins`
--

INSERT INTO `worker_check_ins` (`id`, `attendance_id`, `worker_id`, `scheduled_time`, `actual_time`, `grace_period_end`, `status`, `location`, `created_at`, `updated_at`) VALUES
(1, 1, 21, '2025-03-01 07:36:35', '2025-02-14 11:38:43', '2025-02-28 14:03:55', 'complete', 'USA', '2025-02-13 06:58:34', NULL),
(3, 1, 21, '2025-03-01 09:09:27', NULL, '2025-02-17 15:34:23', 'missed', '', '2025-02-14 11:41:06', '2025-03-01 09:09:27');

-- --------------------------------------------------------

--
-- Table structure for table `worker_documents`
--

CREATE TABLE `worker_documents` (
  `id` int(11) NOT NULL,
  `worker_id` int(11) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `worker_documents`
--

INSERT INTO `worker_documents` (`id`, `worker_id`, `file_path`, `file_name`) VALUES
(7, 20, 'worker_documents/1737638400_loneworker.sql', '1737638400_loneworker.sql'),
(8, 20, 'worker_documents/1737638400_srs_template.doc', '1737638400_srs_template.doc'),
(9, 20, 'worker_documents/1737638400_metformin2.jpg', '1737638400_metformin2.jpg'),
(10, 22, 'worker_documents/1740152081_Vceela Proposal Lone Worker Application - Phase 1 - v1.3 (1).pdf', '1740152081_Vceela Proposal Lone Worker Application - Phase 1 - v1.3 (1).pdf'),
(11, 23, 'worker_documents/1740152166_Vceela Proposal Lone Worker Application - Phase 1 - v1.3 (1).pdf', '1740152166_Vceela Proposal Lone Worker Application - Phase 1 - v1.3 (1).pdf'),
(12, 23, 'worker_documents/1742741450_screencapture-127-0-0-1-8000-register-2025-03-23-01_16_13.pdf', '1742741450_screencapture-127-0-0-1-8000-register-2025-03-23-01_16_13.pdf');

-- --------------------------------------------------------

--
-- Table structure for table `worker_monitor`
--

CREATE TABLE `worker_monitor` (
  `monitor_id` int(11) NOT NULL,
  `worker_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `worker_monitor`
--

INSERT INTO `worker_monitor` (`monitor_id`, `worker_id`, `created_at`, `updated_at`) VALUES
(2, 24, '2025-02-22 14:09:25', '2025-02-22 14:09:25'),
(3, 21, '2025-02-21 15:01:55', '2025-02-21 15:01:55'),
(4, 2, '2025-02-21 15:07:01', '2025-02-21 15:07:01'),
(4, 21, '2025-02-21 15:06:31', '2025-02-21 15:06:31'),
(4, 23, '2025-02-21 15:36:06', '2025-02-21 15:36:06'),
(4, 24, '2025-02-22 14:09:25', '2025-02-22 14:09:25'),
(4, 27, '2025-02-24 14:56:27', '2025-02-24 14:56:27'),
(4, 28, '2025-02-27 14:41:48', '2025-02-27 14:41:48'),
(4, 29, '2025-03-20 15:05:06', '2025-03-20 15:05:06'),
(22, 24, '2025-02-22 14:08:55', '2025-02-22 14:08:55');

-- --------------------------------------------------------

--
-- Table structure for table `worker_notifications`
--

CREATE TABLE `worker_notifications` (
  `id` int(11) NOT NULL,
  `worker_id` int(11) NOT NULL,
  `description` varchar(255) NOT NULL,
  `url` varchar(255) DEFAULT NULL,
  `notification_read` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `worker_shift_site`
--

CREATE TABLE `worker_shift_site` (
  `id` int(11) NOT NULL,
  `worker_id` int(11) NOT NULL,
  `shift_id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `custom_start_time` varchar(20) DEFAULT NULL,
  `custom_end_time` varchar(20) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `worker_shift_site`
--

INSERT INTO `worker_shift_site` (`id`, `worker_id`, `shift_id`, `site_id`, `custom_start_time`, `custom_end_time`, `start_date`, `end_date`) VALUES
(1, 21, 1, 1, '12:00 AM', '6:00 AM', '2025-02-01', '2025-03-28'),
(2, 21, 3, 2, NULL, NULL, '2025-02-01', '2025-03-28');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `alerts`
--
ALTER TABLE `alerts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `worker_id` (`worker_id`),
  ADD KEY `check_in_id` (`check_in_id`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `worker_id` (`worker_id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cards`
--
ALTER TABLE `cards`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subscriber_id` (`subscriber_id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_subscriber_customer` (`subscriber_id`),
  ADD KEY `fk_customer_monitor` (`monitor_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `features`
--
ALTER TABLE `features`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `lwadmin`
--
ALTER TABLE `lwadmin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `cell_no` (`cell_no`),
  ADD UNIQUE KEY `phone_no` (`phone_no`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `plans`
--
ALTER TABLE `plans`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `plan_features`
--
ALTER TABLE `plan_features`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `shifts`
--
ALTER TABLE `shifts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_shift_subscriber` (`subscriber_id`);

--
-- Indexes for table `sites`
--
ALTER TABLE `sites`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_site_subscriber` (`subscriber_id`),
  ADD KEY `fk_customer_site` (`customer_id`),
  ADD KEY `fk_monitor` (`monitor_id`);

--
-- Indexes for table `subscribers`
--
ALTER TABLE `subscribers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subscription_id` (`plan_id`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `timings`
--
ALTER TABLE `timings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_subscriber_id` (`subscriber_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- Indexes for table `workers`
--
ALTER TABLE `workers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_worker_subscriber_id` (`subscriber_id`),
  ADD KEY `fk_worker_monitor` (`monitor_id`);

--
-- Indexes for table `worker_check_ins`
--
ALTER TABLE `worker_check_ins`
  ADD PRIMARY KEY (`id`),
  ADD KEY `attendance_id` (`attendance_id`);

--
-- Indexes for table `worker_documents`
--
ALTER TABLE `worker_documents`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `worker_monitor`
--
ALTER TABLE `worker_monitor`
  ADD PRIMARY KEY (`monitor_id`,`worker_id`),
  ADD KEY `fk_bridge_worker` (`worker_id`);

--
-- Indexes for table `worker_notifications`
--
ALTER TABLE `worker_notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `worker_shift_site`
--
ALTER TABLE `worker_shift_site`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_worker` (`worker_id`),
  ADD KEY `fk_shift` (`shift_id`),
  ADD KEY `fk_site` (`site_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `alerts`
--
ALTER TABLE `alerts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `cards`
--
ALTER TABLE `cards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `features`
--
ALTER TABLE `features`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `lwadmin`
--
ALTER TABLE `lwadmin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `plans`
--
ALTER TABLE `plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `plan_features`
--
ALTER TABLE `plan_features`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `shifts`
--
ALTER TABLE `shifts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `sites`
--
ALTER TABLE `sites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `subscribers`
--
ALTER TABLE `subscribers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `timings`
--
ALTER TABLE `timings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=97;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `workers`
--
ALTER TABLE `workers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `worker_check_ins`
--
ALTER TABLE `worker_check_ins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `worker_documents`
--
ALTER TABLE `worker_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `worker_notifications`
--
ALTER TABLE `worker_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `worker_shift_site`
--
ALTER TABLE `worker_shift_site`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `alerts`
--
ALTER TABLE `alerts`
  ADD CONSTRAINT `alerts_ibfk_1` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`),
  ADD CONSTRAINT `alerts_ibfk_2` FOREIGN KEY (`check_in_id`) REFERENCES `worker_check_ins` (`id`);

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`);

--
-- Constraints for table `cards`
--
ALTER TABLE `cards`
  ADD CONSTRAINT `cards_ibfk_1` FOREIGN KEY (`subscriber_id`) REFERENCES `subscribers` (`id`);

--
-- Constraints for table `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `fk_customer_monitor` FOREIGN KEY (`monitor_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `fk_subscriber_customer` FOREIGN KEY (`subscriber_id`) REFERENCES `subscribers` (`id`);

--
-- Constraints for table `shifts`
--
ALTER TABLE `shifts`
  ADD CONSTRAINT `fk_shift_subscriber` FOREIGN KEY (`subscriber_id`) REFERENCES `subscribers` (`id`);

--
-- Constraints for table `sites`
--
ALTER TABLE `sites`
  ADD CONSTRAINT `fk_customer_site` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  ADD CONSTRAINT `fk_monitor` FOREIGN KEY (`monitor_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_site_subscriber` FOREIGN KEY (`subscriber_id`) REFERENCES `subscribers` (`id`);

--
-- Constraints for table `subscribers`
--
ALTER TABLE `subscribers`
  ADD CONSTRAINT `subscribers_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `subscriptions` (`id`);

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `fk_subscriber_id` FOREIGN KEY (`subscriber_id`) REFERENCES `subscribers` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_subscriber` FOREIGN KEY (`subscriber_id`) REFERENCES `subscribers` (`id`);

--
-- Constraints for table `workers`
--
ALTER TABLE `workers`
  ADD CONSTRAINT `fk_worker_monitor` FOREIGN KEY (`monitor_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `fk_worker_subscriber_id` FOREIGN KEY (`subscriber_id`) REFERENCES `subscribers` (`id`);

--
-- Constraints for table `worker_check_ins`
--
ALTER TABLE `worker_check_ins`
  ADD CONSTRAINT `worker_check_ins_ibfk_1` FOREIGN KEY (`attendance_id`) REFERENCES `attendance` (`id`);

--
-- Constraints for table `worker_monitor`
--
ALTER TABLE `worker_monitor`
  ADD CONSTRAINT `fk_bridge_monitor` FOREIGN KEY (`monitor_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_bridge_worker` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `worker_shift_site`
--
ALTER TABLE `worker_shift_site`
  ADD CONSTRAINT `fk_shift` FOREIGN KEY (`shift_id`) REFERENCES `shifts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_site` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_worker` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
