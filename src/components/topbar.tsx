// Topbar Component
function Topbar({
    statsData,
  }: {
    statsData: { title: string; value: number }[];
  }) {
    return (
      <div className="w-full bg-white shadow-lg rounded-lg p-6 mb-4">
        <div className="flex justify-center font-bold text-xl text-center text-indigo-700 mb-4">
          Live Data from WebSocket
        </div>
        <div className="flex flex-wrap justify-around items-center gap-2">
          {statsData.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <span className="font-semibold text-gray-700">{stat.title}</span>
              <span className="text-gray-500">{stat.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
export default Topbar
