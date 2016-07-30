using CsvIngestion.Mappings;
using CsvIngestion.Models;
using CsvHelper;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CsvIngestion.Services
{
	public class ToiletService
	{
		static public List<BikeRack> ToiletLocations { get; private set;}

		public ToiletService(string location = "")
		{
			if (ToiletLocations == null)
			{

				if (location.Equals(""))
				{
					location = "/Static/ToiletmapExport.csv";
				}

				var ToiletLocationsCSV = new CsvReader(File.OpenText(location));
				ToiletLocationsCSV.Configuration.RegisterClassMap<ToiletMap>();
				ToiletLocations = ToiletLocationsCSV.GetRecords<Toilet>().ToList();
			}
		}

	}
}
