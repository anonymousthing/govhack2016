using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CsvIngestion.Models
{
    public class Toilet
    {
        public string Suburb { get; set; }
        public string Address { get; set; }
		public string State { get; set; }
        public Decimal Latitude { get; set; }
        public Decimal Longitude { get; set; }
    }
}
