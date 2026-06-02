class CafeNav extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <nav class="bg-[#DFC6B0] border-t border-[#c9b4a1] flex justify-between items-center px-4 py-2 z-50 font-nunito shrink-0 pb-safe relative">
        <a href="index.html" class="flex flex-col items-center w-14">
          <img src="images/today.png" alt="Today" class="w-12 h-12 object-contain">
          <span class="text-[12px] font-bold text-[#5a4a42] mt-1">Today</span>
        </a>
        
        <a href="calendar.html" class="flex flex-col items-center w-14">
          <img src="images/calender.png" alt="Calender" class="w-12 h-12 object-contain">
          <span class="text-[12px] font-bold text-[#5a4a42] mt-1">Calender</span>
        </a>
        
        <a href="index.html" id="nav-logo" class="flex flex-col items-center w-16 outline-none focus:outline-none">
          <img src="images/logo.png" alt="Logo" class="w-16 h-16 object-contain">
        </a>

        <a href="memo.html" class="flex flex-col items-center w-14">
          <img src="images/memo.png" alt="Memo" class="w-12 h-12 object-contain">
          <span class="text-[12px] font-bold text-[#5a4a42] mt-1">Memo</span>
        </a>

        <a href="setting.html" class="flex flex-col items-center w-14">
          <img src="images/setting.png" alt="Setting" class="w-12 h-12 object-contain">
          <span class="text-[12px] font-bold text-[#5a4a42] mt-1">Setting</span>
        </a>
      </nav>
    `;
  }
}
customElements.define('cafe-nav', CafeNav);
