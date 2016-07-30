using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CsvIngestion.Models
{
    public class BikeRack
    {
        public string Suburb { get; set; }
        public string Address { get; set; }
        public string LocationDescription { get; set; }
        public UInt32 Capacity { get; set; }
        public string RackType { get; set; }
        public Decimal Latitude { get; set; }
        public Decimal Longitude { get; set; }
    }
}
