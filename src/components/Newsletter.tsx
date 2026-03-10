export default function Newsletter() {
  return (
    <section className="section_newsletter py-24 bg-[#f8f8f8] border-t border-[#f0f0f0]">
      <div className="padding-global px-5">
        <div className="container-medium max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold uppercase tracking-wide mb-3 text-[#1c1a19]">Join the Collective</h2>
          <p className="text-xs text-[#666666] mb-10 font-light tracking-wide">Sign up for early access to drops, exclusive offers, and tales from the road.</p>
          
          <div className="newsletter_form-block">
            <form className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto relative border border-[#e5e5e5]">
              <input 
                type="email" 
                placeholder="ENTER YOUR EMAIL" 
                className="flex-1 bg-white h-12 px-6 text-xs outline-none text-[#1c1a19] placeholder:text-gray-400 placeholder:tracking-widest placeholder:uppercase font-light"
              />
              <button 
                type="submit" 
                className="bg-[#a58c69] text-white h-12 px-8 font-bold uppercase text-[10px] tracking-widest hover:bg-[#8f6f4a] transition-colors btn-tan"
              >
                Subscribe
              </button>
            </form>
            <div className="mt-6 flex items-center justify-center gap-3">
              <input 
                type="checkbox" 
                id="consent" 
                className="w-3.5 h-3.5 border border-gray-300 rounded-none cursor-pointer custom-checkbox transition-colors"
              />
              <label htmlFor="consent" className="text-[9px] uppercase tracking-widest text-[#888] cursor-pointer select-none">
                I agree to the privacy policy
              </label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
