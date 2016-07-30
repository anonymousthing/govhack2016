using CsvIngestion.Models;
using CsvHelper.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CsvIngestion.Mappings
{
    public sealed class ToiletMap : CsvClassMap<Toilet>
    {
        public ToiletMap()
        {
            Map(m => m.Suburb).Name("Town");
            Map(m => m.Address).Name("Address1");
			Map(m => m.State).Name("State");
            Map(m => m.Latitude).Name("Latitude");
            Map(m => m.Longitude).Name("Longitude");
        }
    }
}
