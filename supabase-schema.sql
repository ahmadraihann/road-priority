-- ========================================
-- Supabase Schema for Road Priority SPPK
-- Run this in the Supabase SQL Editor
-- ========================================

-- 1. Tabel Kriteria (Dynamic criteria & weights)
CREATE TABLE criteria (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(10) NOT NULL,
  name VARCHAR(100) NOT NULL,
  key VARCHAR(50) NOT NULL UNIQUE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('cost', 'benefit')),
  weight DECIMAL(5,4) NOT NULL,
  unit VARCHAR(50),
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Data Jalan
CREATE TABLE roads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  road_id VARCHAR(100) NOT NULL,
  nama_jalan VARCHAR(200) NOT NULL,
  polyline TEXT,
  criteria_values JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Hasil Analisis
CREATE TABLE analysis_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  road_id UUID REFERENCES roads(id) ON DELETE CASCADE,
  score DECIMAL(10,6) NOT NULL,
  rank INT NOT NULL,
  category VARCHAR(50) NOT NULL,
  distance_positive DECIMAL(10,6),
  distance_negative DECIMAL(10,6),
  criteria_snapshot JSONB,
  weights_snapshot JSONB,
  analysis_batch_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- Seed initial criteria (6 default criteria)
-- ========================================
INSERT INTO criteria (code, name, key, type, weight, unit, description, sort_order) VALUES
  ('C1', 'Kondisi Fisik (PCI)', 'pci', 'cost', 0.30, 'PCI', 'Pavement Condition Index - semakin rendah semakin prioritas', 1),
  ('C2', 'Volume Lalu Lintas', 'volumeLaluLintas', 'benefit', 0.25, 'kend/hari', 'Jumlah kendaraan per hari', 2),
  ('C3', 'Tingkat Keselamatan', 'tingkatKeselamatan', 'benefit', 0.15, 'kejadian', 'Jumlah kecelakaan per tahun', 3),
  ('C4', 'Estimasi Biaya', 'estimasiBiaya', 'cost', 0.12, 'Rupiah', 'Estimasi biaya perbaikan', 4),
  ('C5', 'Fungsi Jaringan', 'fungsiJaringan', 'cost', 0.10, 'Skala 1-4', 'Fungsi jaringan jalan (1=Arteri, 4=Lingkungan)', 5),
  ('C6', 'Dampak Penduduk', 'dampakPenduduk', 'benefit', 0.08, 'jiwa', 'Jumlah penduduk yang terlayani', 6);

-- ========================================
-- Seed initial roads data
-- ========================================
INSERT INTO roads (road_id, nama_jalan, polyline, criteria_values) VALUES
  ('jl_way/24277036', 'Jalan Urip Sumoharjo', '[[-7.7830943,110.3877194],[-7.7830952,110.3875737],[-7.7830947,110.3874719],[-7.7830921,110.3872474],[-7.7830914,110.3871559],[-7.7830844,110.3865288],[-7.7830841,110.3865133],[-7.7830796,110.3861972],[-7.7830791,110.386164],[-7.7830789,110.3861351],[-7.783078,110.3859572],[-7.7830675,110.3853305],[-7.7830641,110.3851556],[-7.7830611,110.3849882],[-7.7830519,110.3836722],[-7.7830498,110.3835945],[-7.7830467,110.383304],[-7.7830456,110.3828302],[-7.7830438,110.3826503],[-7.7830435,110.3826267],[-7.783043,110.382423],[-7.7830424,110.3823671],[-7.7830421,110.3823041],[-7.7830349,110.3814199],[-7.7830341,110.3813123],[-7.7830285,110.3807005],[-7.7830251,110.3804824],[-7.7830113,110.3796062],[-7.7830095,110.3794447],[-7.7830091,110.3794182],[-7.7830085,110.3792346]]', '{"pci":"55.2","volumeLaluLintas":"14000","tingkatKeselamatan":"7","estimasiBiaya":"3200000000","fungsiJaringan":"1","dampakPenduduk":"42000"}'),
  ('jl_way/24277046', 'Jalan Re. Martadinata', '[[-7.8010428,110.3525321],[-7.8010749,110.3524707],[-7.8010734,110.3522252],[-7.8010667,110.3519428],[-7.801063,110.3518268]]', '{"pci":"60.1","volumeLaluLintas":"9500","tingkatKeselamatan":"7","estimasiBiaya":"900000000","fungsiJaringan":"2","dampakPenduduk":"18000"}'),
  ('jl_way/24795476', 'Jalan Aipda Karel Satsuit Tubun', '[[-7.7975513,110.3564998],[-7.7975582,110.3569328],[-7.7975693,110.357277],[-7.7975665,110.3574229],[-7.7975655,110.3574611],[-7.7975564,110.3579061],[-7.7975558,110.3579825],[-7.7975537,110.3582494],[-7.797553,110.3583023],[-7.7975464,110.3587785],[-7.7975455,110.3588275],[-7.7975447,110.3588876],[-7.7975672,110.3593623],[-7.7975899,110.3598424],[-7.7976087,110.3602398],[-7.7976152,110.3606326],[-7.7976212,110.3609934],[-7.7976254,110.3612431],[-7.797626,110.361277],[-7.7976215,110.3613889],[-7.7976402,110.3621351]]', '{"pci":"48.9","volumeLaluLintas":"11000","tingkatKeselamatan":"6","estimasiBiaya":"2100000000","fungsiJaringan":"2","dampakPenduduk":"25000"}'),
  ('jl_way/24795610', 'Jalan Parangtritis', '[[-7.8245208,110.3677011],[-7.8245462,110.3676995],[-7.8245871,110.367696],[-7.8253158,110.367634],[-7.8255552,110.3676148],[-7.8258537,110.3676072],[-7.8260519,110.3675794],[-7.827173,110.3674767],[-7.8276803,110.3674481],[-7.8279822,110.367436],[-7.8288318,110.3673598],[-7.8289181,110.3673544],[-7.8289914,110.3673455],[-7.8291662,110.3673289],[-7.8295988,110.3672987],[-7.8302134,110.3672502],[-7.8311472,110.3671707],[-7.8318302,110.3671369],[-7.8320414,110.3671161],[-7.8324719,110.3670846],[-7.832545,110.3670752],[-7.8325955,110.3670658],[-7.8326739,110.3670329],[-7.8327988,110.3669769],[-7.8330392,110.3668646],[-7.8331979,110.3667921],[-7.8335348,110.3666353],[-7.8337061,110.3665542],[-7.8348037,110.3660465]]', '{"pci":"40.3","volumeLaluLintas":"18000","tingkatKeselamatan":"5","estimasiBiaya":"4500000000","fungsiJaringan":"1","dampakPenduduk":"60000"}'),
  ('jl_way/24884704', 'Jalan Wonosari', '[[-7.8106954,110.4021372],[-7.8107023,110.402398],[-7.8107233,110.40319],[-7.8107288,110.4032933],[-7.8107386,110.4034754],[-7.8107418,110.4036142],[-7.8107621,110.4039971],[-7.8107739,110.4045048],[-7.8107796,110.4047493],[-7.8107911,110.404879],[-7.8107927,110.4051061],[-7.810799,110.4052804],[-7.8108054,110.405517],[-7.8108148,110.4056524],[-7.810813,110.4060391],[-7.8108141,110.4061065],[-7.8108334,110.4066001],[-7.8108419,110.4067973],[-7.8108711,110.4071904],[-7.8109052,110.4073975],[-7.8109455,110.4075466],[-7.8109612,110.4075925],[-7.8109912,110.4076803],[-7.8110808,110.4078864],[-7.8111629,110.4080409],[-7.8112958,110.408293],[-7.8114005,110.4084728],[-7.8114275,110.4085149]]', '{"pci":"20.2","volumeLaluLintas":"14800","tingkatKeselamatan":"11","estimasiBiaya":"600000000","fungsiJaringan":"1","dampakPenduduk":"48000"}'),
  ('jl_way/24884718', 'Jalan Kapten Pierre Tendean', '[[-7.801063,110.3518268],[-7.8012406,110.3517894],[-7.802275,110.35158],[-7.8033601,110.3513481],[-7.8044584,110.3511296],[-7.8051744,110.3509928],[-7.8055459,110.3509238],[-7.806657,110.3506796],[-7.8077373,110.3504421],[-7.8078374,110.3504201]]', '{"pci":"18.5","volumeLaluLintas":"15000","tingkatKeselamatan":"12","estimasiBiaya":"500000000","fungsiJaringan":"1","dampakPenduduk":"50000"}'),
  ('jl_way/25006119', 'Jalan Panembahan Senopati', '[[-7.8015781,110.3692318],[-7.801572,110.3690469]]', '{"pci":"75.3","volumeLaluLintas":"7000","tingkatKeselamatan":"8","estimasiBiaya":"400000000","fungsiJaringan":"2","dampakPenduduk":"12000"}'),
  ('jl_way/25006121', 'Jalan Cendrawasih', '[[-7.7791923,110.388472],[-7.7793701,110.3889117],[-7.7795022,110.3892719],[-7.7795856,110.3895281],[-7.7797315,110.3900164],[-7.7798031,110.3901963],[-7.7798487,110.3903149],[-7.7799002,110.390475],[-7.779945,110.3906441],[-7.7800182,110.3909807],[-7.7800827,110.3912734],[-7.7801652,110.391635],[-7.7803353,110.3923808]]', '{"pci":"58.6","volumeLaluLintas":"9000","tingkatKeselamatan":"7","estimasiBiaya":"1600000000","fungsiJaringan":"3","dampakPenduduk":"17000"}'),
  ('jl_way/25006122', 'Jalan Ibu Ruswo', '[[-7.8033001,110.3656356],[-7.8033675,110.3661999],[-7.8033841,110.366339],[-7.8034221,110.3666575],[-7.8034595,110.3669703],[-7.803511,110.3674014],[-7.8035908,110.3680695],[-7.8036164,110.3682833],[-7.8036807,110.3688221],[-7.8037029,110.3690077]]', '{"pci":"49.8","volumeLaluLintas":"8500","tingkatKeselamatan":"6","estimasiBiaya":"1400000000","fungsiJaringan":"3","dampakPenduduk":"15000"}'),
  ('jl_way/25006154', 'Jalan Kyai Mojo', '[[-7.7828855,110.3607898],[-7.7828854,110.3605919],[-7.7828782,110.3600934],[-7.7828712,110.3596161],[-7.7828693,110.3595039],[-7.7828639,110.3592342],[-7.7828474,110.3590326],[-7.7828433,110.3589093],[-7.7828424,110.3588147],[-7.7828415,110.3587222],[-7.7828402,110.3585895],[-7.7828438,110.3583811],[-7.7828481,110.3581464],[-7.7828508,110.3579963]]', '{"pci":"61.4","volumeLaluLintas":"10000","tingkatKeselamatan":"7","estimasiBiaya":"1700000000","fungsiJaringan":"2","dampakPenduduk":"21000"}'),
  ('jl_way/25006155', 'Jalan Mayor Jenderal Bambang Sugeng', '[[-7.7972807,110.3776123],[-7.7972619,110.3774792],[-7.7972275,110.3771605],[-7.7972192,110.3770906],[-7.7972036,110.376935],[-7.7971326,110.3763218],[-7.7970909,110.3758382],[-7.7970395,110.3752416],[-7.7970319,110.3751536],[-7.7970254,110.3750159],[-7.7970155,110.3749152],[-7.796973,110.3742408],[-7.7969456,110.3738444],[-7.7968523,110.3727903],[-7.7968395,110.3726462]]', '{"pci":"44.2","volumeLaluLintas":"13000","tingkatKeselamatan":"6","estimasiBiaya":"3000000000","fungsiJaringan":"1","dampakPenduduk":"34000"}'),
  ('jl_way/25006156', 'Jalan Panembahan Senopati', '[[-7.8015799,110.3693032],[-7.8015781,110.3692318]]', '{"pci":"78.9","volumeLaluLintas":"6000","tingkatKeselamatan":"9","estimasiBiaya":"350000000","fungsiJaringan":"2","dampakPenduduk":"10000"}'),
  ('jl_way/25006158', 'Jalan Suroto', '[[-7.7852014,110.3746285],[-7.7856803,110.374548],[-7.7858651,110.3745164],[-7.7864015,110.3744236],[-7.7865469,110.3743979],[-7.7867166,110.3743679]]', '{"pci":"63.7","volumeLaluLintas":"9200","tingkatKeselamatan":"7","estimasiBiaya":"1200000000","fungsiJaringan":"3","dampakPenduduk":"16000"}');

-- ========================================
-- Enable RLS (Row Level Security) - Allow public access for this student project
-- ========================================
ALTER TABLE criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE roads ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to criteria" ON criteria FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to roads" ON roads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to analysis_results" ON analysis_results FOR ALL USING (true) WITH CHECK (true);
