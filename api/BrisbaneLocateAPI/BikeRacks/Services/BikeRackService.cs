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
    public class BikeRackService
    {
        static public List<BikeRack> BikeRacks { get; private set;}

        public BikeRackService()
        {
            if (BikeRacks == null)
            {
                var BikeRackLocationsCSV = new CsvReader(File.OpenText("./Static/CBD-bike-racks.csv"));
                BikeRackLocationsCSV.Configuration.RegisterClassMap<BikeRackMap>();
                BikeRacks = BikeRackLocationsCSV.GetRecords<BikeRack>().ToList();
            }
        }
        
    }
}
