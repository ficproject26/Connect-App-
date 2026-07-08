const fs = require('fs');
const path = 'd:/Connect App/frontend/src/components/landing/HowItWorks.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/const stepStyles = \[[\s\S]*?\];/m, `const stepStyles = [
  {
    // Step 1: Navy Blue
    cardActiveCls: 'bg-gradient-to-br from-[#1E3A8A] to-[#1E40AF] dark:from-[#0F172A] dark:to-[#1E3A8A] border-blue-700 shadow-[0_12px_35px_-10px_rgba(30,58,138,0.5)]',
    iconActiveCls: 'bg-blue-800/50 text-blue-100 border border-blue-700/50',
    titleActiveCls: 'text-white',
    descActiveCls: 'text-blue-100 dark:text-blue-200',
    badgeActiveCls: 'bg-blue-900 text-white border-blue-700 ring-blue-900/30',
  },
  {
    // Step 2: Light Blue
    cardActiveCls: 'bg-gradient-to-br from-[#F8FAFC] to-[#E0F2FE] dark:from-[#0F172A] dark:to-[#0C2D48] border-sky-400 dark:border-sky-500/40 shadow-[0_12px_35px_-10px_rgba(14,165,233,0.3)]',
    iconActiveCls: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30',
    titleActiveCls: 'text-sky-700 dark:text-sky-400',
    descActiveCls: 'text-slate-700 dark:text-slate-300',
    badgeActiveCls: 'bg-sky-500 text-white border-sky-500 ring-sky-500/30',
  },
  {
    // Step 3: Light Pink
    cardActiveCls: 'bg-gradient-to-br from-[#FDF8FA] to-[#FCE7F3] dark:from-[#0F172A] dark:to-[#3F1B2C] border-pink-400 dark:border-pink-500/40 shadow-[0_12px_35px_-10px_rgba(236,72,153,0.3)]',
    iconActiveCls: 'bg-pink-500/15 text-pink-650 dark:text-pink-400 border border-pink-500/30',
    titleActiveCls: 'text-pink-700 dark:text-pink-400',
    descActiveCls: 'text-slate-700 dark:text-slate-300',
    badgeActiveCls: 'bg-pink-500 text-white border-pink-500 ring-pink-500/30',
  },
  {
    // Step 4: Ash (Cool grey)
    cardActiveCls: 'bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] dark:from-[#0F172A] dark:to-[#1E293B] border-slate-400 dark:border-slate-500/40 shadow-[0_12px_35px_-10px_rgba(100,116,139,0.3)]',
    iconActiveCls: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30',
    titleActiveCls: 'text-slate-700 dark:text-slate-400',
    descActiveCls: 'text-slate-700 dark:text-slate-300',
    badgeActiveCls: 'bg-slate-500 text-white border-slate-500 ring-slate-500/30',
  },
  {
    // Step 5: Orange
    cardActiveCls: 'bg-gradient-to-br from-[#FFFBF7] to-[#FFEDD5] dark:from-[#0F172A] dark:to-[#381E15] border-orange-400 dark:border-orange-500/40 shadow-[0_12px_35px_-10px_rgba(249,115,22,0.3)]',
    iconActiveCls: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30',
    titleActiveCls: 'text-orange-700 dark:text-orange-400',
    descActiveCls: 'text-slate-700 dark:text-slate-300',
    badgeActiveCls: 'bg-orange-500 text-white border-orange-500 ring-orange-500/30',
  },
];`);

content = content.replace(
/                      \{\/\* Premium Glassmorphic Card \*\/\}[\s\S]*?                      \{\/\* Timeline Badge \(Floating circle\) \*\/\}[\s\S]*?<\/div>/m,
`                      {/* Premium Glassmorphic Card */}
                      <div className={\`p-6 rounded-2xl border transition-all duration-500 hover:-translate-y-1 hover:shadow-xl flex items-start space-x-4 text-left justify-start max-w-md \${
                        isActive
                          ? stepStyles[idx].cardActiveCls
                          : 'bg-white/40 dark:bg-slate-900/20 border-slate-200/60 dark:border-slate-800/40 opacity-40 scale-[0.97] shadow-none pointer-events-none'
                      }\`}>
                        {/* Icon */}
                        <div className={\`p-3 rounded-xl shrink-0 transition-colors duration-300 \${
                          isActive
                            ? stepStyles[idx].iconActiveCls
                            : 'bg-slate-100/50 dark:bg-slate-800/20 text-slate-400 dark:text-slate-600 border border-slate-200/30 dark:border-slate-700/20'
                        }\`}>
                          <step.icon className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col items-start text-left">
                          <h3 className={\`text-base font-bold tracking-tight transition-colors duration-300 \${
                            isActive
                              ? stepStyles[idx].titleActiveCls
                              : 'text-slate-400 dark:text-slate-550'
                          }\`}>
                            {step.title}
                          </h3>
                          <p className={\`mt-2 text-xs md:text-sm leading-relaxed transition-colors duration-300 \${
                            isActive
                              ? stepStyles[idx].descActiveCls
                              : 'text-slate-400/80 dark:text-slate-500'
                          }\`}>
                            {step.desc}
                          </p>
                        </div>
                      </div>

                      {/* Timeline Badge (Floating circle) */}
                      <div
                        ref={(el) => (desktopRefs.current[idx] = el)}
                        className={\`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center font-bold text-sm lg:text-lg transition-all duration-500 border shrink-0 relative z-20 \${
                          isActive
                            ? \\\`\${stepStyles[idx].badgeActiveCls} \${isCurrent ? 'scale-115 shadow-xl ring-4' : 'scale-100 shadow-md ring-0'}\\\`
                            : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 scale-95'
                        }\`}
                      >`);

content = content.replace(
/                      \{\/\* Timeline Badge \(Floating circle\) \*\/\}[\s\S]*?                      \{\/\* Premium Glassmorphic Card \*\/\}[\s\S]*?<\/div>\s*<\/div>/m,
`                      {/* Timeline Badge (Floating circle) */}
                      <div
                        ref={(el) => (desktopRefs.current[idx] = el)}
                        className={\`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center font-bold text-sm lg:text-lg transition-all duration-500 border shrink-0 relative z-20 \${
                          isActive
                            ? \\\`\${stepStyles[idx].badgeActiveCls} \${isCurrent ? 'scale-115 shadow-xl ring-4' : 'scale-100 shadow-md ring-0'}\\\`
                            : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-555 border-slate-200 dark:border-slate-700 scale-95'
                        }\`}
                      >
                        {step.number}
                      </div>

                      {/* Premium Glassmorphic Card */}
                      <div className={\`p-6 rounded-2xl border transition-all duration-500 hover:-translate-y-1 hover:shadow-xl flex items-start space-x-4 text-left justify-start max-w-md \${
                        isActive
                          ? stepStyles[idx].cardActiveCls
                          : 'bg-white/40 dark:bg-slate-900/20 border-slate-200/60 dark:border-slate-800/40 opacity-40 scale-[0.97] shadow-none pointer-events-none'
                      }\`}>
                        {/* Icon */}
                        <div className={\`p-3 rounded-xl shrink-0 transition-colors duration-300 \${
                          isActive
                            ? stepStyles[idx].iconActiveCls
                            : 'bg-slate-100/50 dark:bg-slate-800/20 text-slate-400 dark:text-slate-600 border border-slate-200/30 dark:border-slate-700/20'
                        }\`}>
                          <step.icon className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col items-start text-left">
                          <h3 className={\`text-base font-bold tracking-tight transition-colors duration-300 \${
                            isActive
                              ? stepStyles[idx].titleActiveCls
                              : 'text-slate-400 dark:text-slate-550'
                          }\`}>
                            {step.title}
                          </h3>
                          <p className={\`mt-2 text-xs md:text-sm leading-relaxed transition-colors duration-300 \${
                            isActive
                              ? stepStyles[idx].descActiveCls
                              : 'text-slate-400/80 dark:text-slate-500'
                          }\`}>
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    </div>`);

content = content.replace(
/                  \{\/\* Left Timeline Badge \*\/\}[\s\S]*?                  \{\/\* Card Content Stack \*\/\}[\s\S]*?<\/div>\s*<\/div>/m,
`                  {/* Left Timeline Badge */}
                  <div
                    ref={(el) => (mobileRefs.current[idx] = el)}
                    className={\`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 border shrink-0 relative z-20 \${
                      isActive
                        ? \\\`\${stepStyles[idx].badgeActiveCls} \${isCurrent ? 'scale-110 shadow-lg ring-2' : 'scale-100 shadow-sm ring-0'}\\\`
                        : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-550 border-slate-200 dark:border-slate-700 scale-95'
                    }\`}
                  >
                    {step.number}
                  </div>

                  {/* Card Content Stack */}
                  <div className={\`p-5 rounded-2xl border flex items-start space-x-3 text-left justify-start flex-1 transition-all duration-500 \${
                    isActive
                      ? stepStyles[idx].cardActiveCls
                      : 'bg-white/40 dark:bg-slate-900/20 border-slate-200/60 dark:border-slate-800/40 opacity-40 scale-[0.97] shadow-none pointer-events-none'
                  }\`}>
                    {/* Icon */}
                    <div className={\`p-2.5 rounded-lg shrink-0 transition-colors duration-300 \${
                      isActive
                        ? stepStyles[idx].iconActiveCls
                        : 'bg-slate-100/50 dark:bg-slate-800/20 text-slate-400 dark:text-slate-600 border border-slate-200/30 dark:border-slate-700/20'
                    }\`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col items-start">
                      <h3 className={\`text-sm font-bold tracking-tight transition-colors duration-300 \${
                        isActive
                          ? stepStyles[idx].titleActiveCls
                          : 'text-slate-450 dark:text-slate-550'
                          }\`}>
                        {step.title}
                      </h3>
                      <p className={\`mt-1 text-xs leading-relaxed transition-colors duration-300 \${
                        isActive
                          ? stepStyles[idx].descActiveCls
                          : 'text-slate-400 dark:text-slate-550'
                      }\`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>`);

fs.writeFileSync(path, content, 'utf8');
console.log('Update complete!');
