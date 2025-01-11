import { SERVICES } from "@/core/Services/constants";

function Filters({
  selectService,
  selectLab,
  labs,
}: {
  selectService: (service: string) => void;
  selectLab: (lab: string) => void;
  labs: ILab[];
}) {
  function onChangeLab(e: React.ChangeEvent<HTMLSelectElement>) {
    selectLab(e.target.value);
  }

  function onChangeService(e: React.ChangeEvent<HTMLSelectElement>) {
    selectService(e.target.value);
  }

  return (
    <div className="w-full min-w-fit max-w-sm">
      <div className="relative">
        <label className="text-sm font-medium text-slate-700">
          Service types
        </label>
        <select
          onChange={onChangeService}
          className="ease w-full cursor-pointer appearance-none rounded border border-slate-200 bg-transparent py-2 pl-3 pr-8 text-sm text-slate-700 shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-400 focus:shadow-md focus:outline-none"
        >
          <option value="">All</option>
          {SERVICES.map((software) => (
            <option key={software} value={software}>
              {software}
            </option>
          ))}
        </select>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.2"
          stroke="currentColor"
          className="absolute right-2.5 top-8 ml-1 h-5 w-5 text-slate-700"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
          />
        </svg>
      </div>
      <div className="relative">
        <label className="text-sm font-medium text-slate-700">Labs</label>
        <select
          onChange={onChangeLab}
          className="ease w-full cursor-pointer appearance-none rounded border border-slate-200 bg-transparent py-2 pl-3 pr-8 text-sm text-slate-700 shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-400 focus:shadow-md focus:outline-none"
        >
          <option value="">All</option>
          {labs.map((lab) => (
            <option key={lab.id} value={lab.name}>
              {lab.name}
            </option>
          ))}
        </select>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.2"
          stroke="currentColor"
          className="absolute right-2.5 top-8 ml-1 h-5 w-5 text-slate-700"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
          />
        </svg>
      </div>
    </div>
  );
}

export default Filters;
