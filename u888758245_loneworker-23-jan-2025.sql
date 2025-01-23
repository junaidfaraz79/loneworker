-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jan 23, 2025 at 09:49 AM
-- Server version: 10.11.10-MariaDB
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u888758245_loneworker`
--

-- --------------------------------------------------------

--
-- Table structure for table `check_in_frequency`
--

CREATE TABLE `check_in_frequency` (
  `id` int(11) NOT NULL,
  `time` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `check_in_frequency`
--

INSERT INTO `check_in_frequency` (`id`, `time`) VALUES
(1, 'No Timer'),
(2, '30 mins'),
(3, '60 mins'),
(4, '90 mins'),
(5, '2 Hours'),
(6, '2.5 Hours'),
(7, '3 Hours'),
(8, '3.5 Hours'),
(9, '4 Hours'),
(10, '4.5 Hours'),
(11, '5 Hours'),
(12, '6 Hours');

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
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `customer_name`, `phone_no`, `email`, `role`, `department`, `customer_image`, `customer_status`, `added_on`, `updated_on`) VALUES
(4, 'Nadeem', '345435435', 'nadeem@company.com', 'Head', 'Security', '', 'active', '2025-01-05 16:34:19', '2025-01-07 19:02:21'),
(6, 'Adnan', '1313123131212', 'adnan@company.com', 'Head', 'Security', '', 'active', '2025-01-05 17:38:07', '2025-01-07 19:02:45'),
(8, 'Kashan', '11111111', 'kashan@company.com', 'Head Guard', 'Security', '', 'active', '2025-01-05 18:21:10', '2025-01-07 19:03:10'),
(10, 'Danish Khan', '4434344345', 'danishkhan@gmail.com', 'Manager', 'Security', 'public/9QJlJxiEgRCTR8Q5SJXV46QjVL0eiCBCUUtQfgsB.jpg', 'active', '2025-01-07 19:01:24', NULL);

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
(1, 'Basic Plan', '<p>Basic Plan</p><p><br></p><p><br></p><p><br></p>', 'paid', '50', '1500', 'yearly', 100, 'published', 'public/7DcpBtfSBd1tqAScZo3mMT1yJHj4fGQIxoRjCv1h.png', '2025-01-03 21:39:35', '2025-01-16 14:30:14'),
(2, 'Economy Plan', '', 'paid', '80', '700', NULL, NULL, NULL, NULL, '2025-01-03 21:45:10', '2025-01-06 14:00:13'),
(3, 'Free', '', 'free', '0', '0', NULL, NULL, NULL, NULL, '2025-01-03 21:45:24', NULL),
(13, 'Diamond Plan', '<p><br></p><p><br></p>', 'select', NULL, NULL, 'select', NULL, 'published', '', '2025-01-07 17:51:23', NULL),
(14, 'Bronze Plan', '<p>Bronze Plan</p><p><br></p>', 'paid', '100', '200', 'yearly', 100, 'published', '', '2025-01-07 17:59:57', '2025-01-07 18:30:12'),
(15, 'Bronze Plan 1', '<p><br></p><p>Bronze Plan 1</p><p><br></p>', 'paid', '100', '1000', 'yearly', 100, 'published', 'public/aEvnmv5wTmvjuCzQNSsoK9l3xqvJFkhI204wKUEP.png', '2025-01-07 18:25:43', '2025-01-07 18:31:54'),
(16, 'Diamond Plan 1', '<p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p>', 'paid', NULL, NULL, 'yearly', NULL, 'published', '', '2025-01-16 11:03:07', '2025-01-16 13:48:38'),
(17, 'Test Plan', '<p><br></p><p><br></p><p><br></p>', 'paid', '1000', '2000', 'yearly', 200, 'published', '', '2025-01-16 12:44:49', '2025-01-16 14:30:28');

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
(27, 1, 'sos-alarm', '2025-01-16 14:30:14'),
(28, 1, 'auto-alarm-escalation', '2025-01-16 14:30:14');

-- --------------------------------------------------------

--
-- Table structure for table `sites`
--

CREATE TABLE `sites` (
  `id` int(11) NOT NULL,
  `site_name` varchar(100) DEFAULT NULL,
  `site_address` varchar(200) DEFAULT NULL,
  `site_status` varchar(10) DEFAULT NULL,
  `site_image` varchar(100) DEFAULT NULL,
  `added_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sites`
--

INSERT INTO `sites` (`id`, `site_name`, `site_address`, `site_status`, `site_image`, `added_on`, `updated_on`) VALUES
(1, 'Tess Site', 'Test Address', 'active', NULL, '2025-01-05 19:13:41', NULL),
(2, 'Al Faiz Group', 'test', 'active', '', '2025-01-05 19:26:35', NULL),
(3, 'Test site 1', 'Test site 1', 'inactive', '', '2025-01-05 19:26:57', NULL);

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
(17, 'junaidfaraz79@gmail.com', 'Test Plan', '<p><br></p><p><br></p>', 'paid', '1000', '2000', 'yearly', 100, 'active', '2025-01-16 12:44:49', '2025-01-17 18:10:59');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `role` varchar(10) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(30) DEFAULT NULL,
  `cell_no` varchar(50) DEFAULT NULL,
  `phone_no` varchar(50) DEFAULT NULL,
  `company_name` varchar(100) NOT NULL,
  `official_address` varchar(150) NOT NULL,
  `designation` varchar(100) NOT NULL,
  `user_image` varchar(100) DEFAULT NULL,
  `added_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `role`, `email`, `password`, `cell_no`, `phone_no`, `company_name`, `official_address`, `designation`, `user_image`, `added_on`, `updated_on`) VALUES
(2, 'Muhammad Junaid Qureshi', 'monitor', 'junaidfaraz79@gmail.com', 'junaidfaraz79@gmail.com', '435345345', '7894561231', 'Test Company', 'Test address', 'Manager', '', '2025-01-03 20:22:31', '2025-01-16 12:43:20'),
(3, 'Test User', 'monitor', 'testuser@gmail.com', 'testuser@gmail.com', '020 7123 4567', '+44 117 2345678', '', '', '', NULL, '2025-01-07 17:41:58', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `workers`
--

CREATE TABLE `workers` (
  `id` int(11) NOT NULL,
  `worker_name` varchar(100) DEFAULT NULL,
  `phone_no` varchar(30) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `pin` varchar(6) DEFAULT NULL,
  `phone_type` varchar(5) DEFAULT NULL,
  `role` varchar(25) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `check_in_frequency` varchar(20) DEFAULT NULL,
  `worker_image` varchar(100) DEFAULT NULL,
  `worker_status` varchar(20) DEFAULT NULL,
  `added_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `workers`
--

INSERT INTO `workers` (`id`, `worker_name`, `phone_no`, `email`, `pin`, `phone_type`, `role`, `department`, `check_in_frequency`, `worker_image`, `worker_status`, `added_on`, `updated_on`) VALUES
(2, 'Kashif', '0325-5454554', 'junaidfaraz79@gmail.com', '123456', 'old', NULL, '', '60 mins', NULL, 'active', '2025-01-03 20:22:31', '2025-01-05 19:37:58'),
(4, 'Nadeem', '345435435', 'admin@marketdata.icu', '', NULL, 'Head', 'Security', '60 mins', '', 'active', '2025-01-05 16:34:19', '2025-01-05 17:59:37'),
(5, 'Jamal', '1313123131212', 'junaidfaraz79@gmail.com', '', NULL, 'Head', 'Security', '60 mins', '', 'active', '2025-01-05 17:33:01', '2025-01-05 17:59:39'),
(6, 'Test Worker', '1313123131212', 'admin@marketdata.icu', '', 'smart', 'Head', 'Security', '60 mins', '', 'active', '2025-01-05 17:38:07', '2025-01-05 19:38:38'),
(7, 'Jamshed Qureshi', '1111111', 'junaidfaraz79@gmail.com', '', 'old', 'Head Guard', 'Security', 'No Timer', '', 'active', '2025-01-05 18:06:19', '2025-01-05 18:18:46'),
(8, 'New Worker', '11111111', 'admin@marketdata.icu', '', 'old', 'Head Guard', 'Security', 'No Timer', '', 'active', '2025-01-05 18:21:10', '2025-01-05 18:26:00'),
(9, 'Salman Qureshi', '4434344345', 'salmanqureshi@gmail.com', '', NULL, 'Head Guard', 'Security', '90 mins', '', 'active', '2025-01-06 15:24:38', '2025-01-07 18:59:37'),
(10, 'Salman Qureshi', '4434344345', 'abc@abc.com', '', 'smart', 'Head Guard', 'Security', '2 Hours', '', 'active', '2025-01-07 18:56:28', '2025-01-07 18:59:57');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `check_in_frequency`
--
ALTER TABLE `check_in_frequency`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `features`
--
ALTER TABLE `features`
  ADD PRIMARY KEY (`id`);

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
-- Indexes for table `sites`
--
ALTER TABLE `sites`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `workers`
--
ALTER TABLE `workers`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `check_in_frequency`
--
ALTER TABLE `check_in_frequency`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `features`
--
ALTER TABLE `features`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `plans`
--
ALTER TABLE `plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `plan_features`
--
ALTER TABLE `plan_features`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `sites`
--
ALTER TABLE `sites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `workers`
--
ALTER TABLE `workers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
