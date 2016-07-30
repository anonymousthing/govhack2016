using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CityCycle.Services;

namespace CityCycleTestApplication
{
    class Program
    {
        static void Main(string[] args)
        {
            CityCycleService service = new CityCycleService();
            service.GetStations();

			static public List<BikeRack> BikeRacks { get; private set;}

			if (BikeRacks == null)
			{

				if (location.Equals(""))
				{
					location = "/Static/CBD-bike-racks.csv";
				}

				var BikeRackLocationsCSV = new CsvReader(File.OpenText(location));
				BikeRackLocationsCSV.Configuration.RegisterClassMap<BikeRackMap>();
				BikeRacks = BikeRackLocationsCSV.GetRecords<BikeRack>().ToList();
			}

        }
    }
}
