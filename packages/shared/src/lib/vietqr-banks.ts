export interface VietQRBank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported?: number;
  lookupSupported?: number;
  support?: number;
  isTransfer?: number;
  swift_code?: string | null;
}

export const VIETNAM_BANKS_DEFAULT: VietQRBank[] = [
  { id: 17, name: 'Ngân hàng TMCP Công thương Việt Nam', code: 'ICB', bin: '970415', shortName: 'VietinBank', logo: 'https://cdn.vietqr.io/img/ICB.png' },
  { id: 43, name: 'Ngân hàng TMCP Ngoại Thương Việt Nam', code: 'VCB', bin: '970436', shortName: 'Vietcombank', logo: 'https://cdn.vietqr.io/img/VCB.png' },
  { id: 4, name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', code: 'BIDV', bin: '970418', shortName: 'BIDV', logo: 'https://cdn.vietqr.io/img/BIDV.png' },
  { id: 42, name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam', code: 'VBA', bin: '970405', shortName: 'Agribank', logo: 'https://cdn.vietqr.io/img/VBA.png' },
  { id: 26, name: 'Ngân hàng TMCP Quân đội', code: 'MB', bin: '970422', shortName: 'MBBank', logo: 'https://cdn.vietqr.io/img/MB.png' },
  { id: 38, name: 'Ngân hàng TMCP Kỹ thương Việt Nam', code: 'TCB', bin: '970407', shortName: 'Techcombank', logo: 'https://cdn.vietqr.io/img/TCB.png' },
  { id: 2, name: 'Ngân hàng TMCP Á Châu', code: 'ACB', bin: '970416', shortName: 'ACB', logo: 'https://cdn.vietqr.io/img/ACB.png' },
  { id: 44, name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', code: 'VPB', bin: '970432', shortName: 'VPBank', logo: 'https://cdn.vietqr.io/img/VPB.png' },
  { id: 39, name: 'Ngân hàng TMCP Tiên Phong', code: 'TPB', bin: '970423', shortName: 'TPBank', logo: 'https://cdn.vietqr.io/img/TPB.png' },
  { id: 35, name: 'Ngân hàng TMCP Sài Gòn Thương Tín', code: 'STB', bin: '970403', shortName: 'Sacombank', logo: 'https://cdn.vietqr.io/img/STB.png' },
  { id: 14, name: 'Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh', code: 'HDB', bin: '970437', shortName: 'HDBank', logo: 'https://cdn.vietqr.io/img/HDB.png' },
  { id: 41, name: 'Ngân hàng TMCP Quốc tế Việt Nam', code: 'VIB', bin: '970441', shortName: 'VIB', logo: 'https://cdn.vietqr.io/img/VIB.png' },
  { id: 33, name: 'Ngân hàng TMCP Sài Gòn - Hà Nội', code: 'SHB', bin: '970443', shortName: 'SHB', logo: 'https://cdn.vietqr.io/img/SHB.png' },
  { id: 34, name: 'Ngân hàng TMCP Sài Gòn', code: 'SCB', bin: '970429', shortName: 'SCB', logo: 'https://cdn.vietqr.io/img/SCB.png' },
  { id: 24, name: 'Ngân hàng TMCP Hàng Hải', code: 'MSB', bin: '970426', shortName: 'MSB', logo: 'https://cdn.vietqr.io/img/MSB.png' },
  { id: 30, name: 'Ngân hàng TMCP Đông Nam Á', code: 'SEAB', bin: '970440', shortName: 'SeABank', logo: 'https://cdn.vietqr.io/img/SEAB.png' },
  { id: 27, name: 'Ngân hàng TMCP Nam Á', code: 'NAB', bin: '970428', shortName: 'NamABank', logo: 'https://cdn.vietqr.io/img/NAB.png' },
  { id: 28, name: 'Ngân hàng TMCP Quốc Dân', code: 'NCB', bin: '970419', shortName: 'NCB', logo: 'https://cdn.vietqr.io/img/NCB.png' },
  { id: 29, name: 'Ngân hàng TMCP Đại Chúng Việt Nam', code: 'PVCB', bin: '970412', shortName: 'PVcomBank', logo: 'https://cdn.vietqr.io/img/PVCB.png' },
  { id: 22, name: 'Ngân hàng TMCP Bưu Điện Liên Việt', code: 'LPB', bin: '970449', shortName: 'LPBank', logo: 'https://cdn.vietqr.io/img/LPB.png' },
  { id: 3, name: 'Ngân hàng TMCP An Bình', code: 'ABB', bin: '970425', shortName: 'ABBANK', logo: 'https://cdn.vietqr.io/img/ABB.png' },
  { id: 5, name: 'Ngân hàng TMCP Bắc Á', code: 'BAB', bin: '970409', shortName: 'BacABank', logo: 'https://cdn.vietqr.io/img/BAB.png' },
  { id: 45, name: 'Ngân hàng Thương mại TNHH MTV Xây dựng Việt Nam', code: 'CBB', bin: '970444', shortName: 'CB', logo: 'https://cdn.vietqr.io/img/CBB.png' },
  { id: 46, name: 'Ngân hàng Thương mại TNHH MTV Đại Dương', code: 'Oceanbank', bin: '970414', shortName: 'Oceanbank', logo: 'https://cdn.vietqr.io/img/Oceanbank.png' },
  { id: 47, name: 'Ngân hàng Thương mại TNHH MTV Dầu Khí Toàn Cầu', code: 'GPB', bin: '970408', shortName: 'GPBank', logo: 'https://cdn.vietqr.io/img/GPB.png' },
  { id: 32, name: 'Ngân hàng TMCP Sài Gòn Công Thương', code: 'SGB', bin: '970400', shortName: 'SaigonBank', logo: 'https://cdn.vietqr.io/img/SGB.png' },
  { id: 6, name: 'Ngân hàng TMCP Bản Việt', code: 'BVB', bin: '970454', shortName: 'BVBank', logo: 'https://cdn.vietqr.io/img/BVB.png' },
  { id: 40, name: 'Ngân hàng TMCP Việt Á', code: 'VAB', bin: '970427', shortName: 'VietABank', logo: 'https://cdn.vietqr.io/img/VAB.png' },
  { id: 48, name: 'Ngân hàng TMCP Việt Nam Thương Tín', code: 'VIETBANK', bin: '970433', shortName: 'VietBank', logo: 'https://cdn.vietqr.io/img/VIETBANK.png' },
  { id: 49, name: 'Ngân hàng TMCP Bảo Việt', code: 'BVB', bin: '970438', shortName: 'BaoVietBank', logo: 'https://cdn.vietqr.io/img/BaoVietBank.png' },
  { id: 50, name: 'Ngân hàng TMCP Kiên Long', code: 'KLB', bin: '970452', shortName: 'Kienlongbank', logo: 'https://cdn.vietqr.io/img/KLB.png' },
  { id: 51, name: 'Ngân hàng TNHH MTV Shinhan Việt Nam', code: 'SHBVN', bin: '970442', shortName: 'ShinhanBank', logo: 'https://cdn.vietqr.io/img/SHBVN.png' },
  { id: 52, name: 'Ngân hàng TNHH MTV Woori Việt Nam', code: 'WRB', bin: '970457', shortName: 'Woori', logo: 'https://cdn.vietqr.io/img/WRB.png' },
  { id: 53, name: 'Ngân hàng TNHH Indovina', code: 'IVB', bin: '970434', shortName: 'IndovinaBank', logo: 'https://cdn.vietqr.io/img/IVB.png' },
  { id: 54, name: 'Ngân hàng TNHH MTV Standard Chartered Việt Nam', code: 'SCVN', bin: '970410', shortName: 'StandardChartered', logo: 'https://cdn.vietqr.io/img/SCVN.png' },
  { id: 55, name: 'Ngân hàng TNHH MTV HSBC Việt Nam', code: 'HSBC', bin: '458761', shortName: 'HSBC', logo: 'https://cdn.vietqr.io/img/HSBC.png' },
  { id: 56, name: 'Ngân hàng TNHH MTV Public Bank Việt Nam', code: 'PBVN', bin: '970439', shortName: 'PublicBank', logo: 'https://cdn.vietqr.io/img/PBVN.png' },
  { id: 57, name: 'Ngân hàng TNHH MTV CIMB Việt Nam', code: 'CIMB', bin: '422589', shortName: 'CIMB', logo: 'https://cdn.vietqr.io/img/CIMB.png' },
  { id: 58, name: 'Ngân hàng TNHH MTV UOB Việt Nam', code: 'UOB', bin: '970458', shortName: 'UOB', logo: 'https://cdn.vietqr.io/img/UOB.png' },
  { id: 59, name: 'Ngân hàng TNHH MTV Hong Leong Việt Nam', code: 'HLBVN', bin: '970442', shortName: 'HongLeong', logo: 'https://cdn.vietqr.io/img/HLBVN.png' },
  { id: 60, name: 'Ngân hàng Hợp tác xã Việt Nam', code: 'COOPBANK', bin: '970446', shortName: 'Co-opBank', logo: 'https://cdn.vietqr.io/img/COOPBANK.png' },
  { id: 61, name: 'Ví điện tử MoMo', code: 'MOMO', bin: '970422', shortName: 'MoMo', logo: 'https://cdn.vietqr.io/img/MOMO.png' },
  { id: 62, name: 'Viettel Money', code: 'VTMONEY', bin: '970422', shortName: 'ViettelMoney', logo: 'https://cdn.vietqr.io/img/VIETTELMONEY.png' },
  { id: 63, name: 'VNPT Money', code: 'VNPTMONEY', bin: '970422', shortName: 'VNPTMoney', logo: 'https://cdn.vietqr.io/img/VNPTMONEY.png' },
  { id: 64, name: 'ZaloPay', code: 'ZALOPAY', bin: '970422', shortName: 'ZaloPay', logo: 'https://cdn.vietqr.io/img/ZALOPAY.png' },
  { id: 65, name: 'ShopeePay', code: 'SHOPEEPAY', bin: '970422', shortName: 'ShopeePay', logo: 'https://cdn.vietqr.io/img/SHOPEEPAY.png' },
];
