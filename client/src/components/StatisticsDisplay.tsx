const StatisticsDisplay = () => {
  const stats = [
    { count: "250+", label: "students" },
    { count: "250+", label: "students" },
    { count: "250+", label: "students" }
  ];

  return (
    <div className="flex flex-wrap items-center mt-12">
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center mr-8 mb-4">
          <div>
            <div className="text-3xl font-bold text-primary-blue">{stat.count}</div>
            <div className="text-neutral-600">{stat.label}</div>
          </div>
          {index < stats.length - 1 && (
            <div className="stats-divider mx-4 mb-4 hidden md:block"></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatisticsDisplay;
