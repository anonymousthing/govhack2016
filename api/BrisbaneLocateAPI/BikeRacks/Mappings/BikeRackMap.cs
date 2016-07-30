using CsvIngestion.Models;
using CsvHelper.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CsvIngestion.Mappings
{
    public sealed class BikeRackMap : CsvClassMap<BikeRack>
    {
        public BikeRackMap()
        {
            Map(m => m.Suburb).Name("Suburb");
            Map(m => m.Address).Name("Address");
            Map(m => m.LocationDescription).Name("Suburb");
            Map(m => m.Capacity).Name("Capacity");
            Map(m => m.RackType).Name("Rack type");
            Map(m => m.Latitude).Name("Latitude");
            Map(m => m.Longitude).Name("Longitude");
        }
    }
}
