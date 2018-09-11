if(!a.hasDate()){
    return -1;
}
if(!b.hasDate()){
    return 1;
}

return b.getMillisecondDateTime()-a.getMillisecondDateTime();
