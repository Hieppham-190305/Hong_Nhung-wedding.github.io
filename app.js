'use strict';
const $ = id => document.getElementById(id);
const guest = new URLSearchParams(location.search).get('guest');
if (guest && guest.trim()) $('guest-name').textContent = guest.trim().slice(0, 100);
const wedding = new Date('2026-12-06T11:00:00+07:00');
function updateCountdown() {
  const seconds = Math.max(0, Math.floor((wedding.getTime() - Date.now()) / 1000));
  const values = [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
  ['days', 'hours', 'minutes', 'seconds'].forEach((key, index) => $(key).textContent = String(values[index]).padStart(2, '0'));
  if (seconds === 0) $('countdown-label').textContent = 'NGÀY HẠNH PHÚC CỦA CHÚNG MÌNH · 06.12.2026';
}
updateCountdown();
setInterval(updateCountdown, 1000);
let toastTimer;
function toast(message) { $('toast').textContent = message; $('toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 3500); }
$('calendar').addEventListener('click', () => {
  const contents = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Nhung Hao//Wedding//VI','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:nhung-hao-20261206@wedding.local','DTSTAMP:20261017T000000Z','DTSTART:20261206T040000Z','DTEND:20261206T070000Z','SUMMARY:Tiệc cưới Hồng Nhung & Việt Hào','LOCATION:The Mira Central Park\\, 128/16 Nguyễn Ái Quốc\\, Đồng Nai','DESCRIPTION:Sảnh Rose - Tầng trệt. Đón khách 11:00\\; làm lễ 12:00 (giờ Việt Nam).','END:VEVENT','END:VCALENDAR',''].join('\r\n');
  const url = URL.createObjectURL(new Blob([contents], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = 'Thiep-cuoi-Nhung-Hao.ics'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Đã tải lịch cưới để bạn lưu vào ứng dụng lịch');
});
